<?php
// app/Http/Controllers/API/Provider/QuoteController.php

namespace App\Http\Controllers\API\Provider;

use App\Http\Controllers\Controller;
use App\Models\Quote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class QuoteController extends Controller
{
    /**
     * Get provider's quotes
     */
    public function index(Request $request)
    {
        $request->validate([
            'status' => 'nullable|in:pending,quoted,accepted,rejected,expired,withdrawn',
            'per_page' => 'nullable|integer|min:1|max:50',
            'page' => 'nullable|integer|min:1',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'client' => 'nullable|string|max:255',
            'service_category' => 'nullable|string|max:255',
            'price_min' => 'nullable|numeric|min:0',
            'price_max' => 'nullable|numeric|min:0',
            'sort_field' => 'nullable|in:created_at,quoted_price,status,requested_date,client_name,service_title',
            'sort_direction' => 'nullable|in:asc,desc',
            'with' => 'nullable|string'
        ]);

        try {
            $user = Auth::user();
            $query = Quote::where('provider_id', $user->id);

            // Include relationships
            $withRelations = ['client', 'service.category'];
            if ($request->with) {
                $requestedWith = explode(',', $request->with);
                $validRelations = array_intersect($requestedWith, ['client', 'service', 'provider']);
                if (!empty($validRelations)) {
                    // Always include service.category for proper data display
                    $withRelations = array_merge($validRelations, ['service.category']);
                    $withRelations = array_unique($withRelations);
                }
            }
            $query->with($withRelations);

            // Apply filters
            if ($request->status) {
                $query->where('status', $request->status);
            }

            if ($request->date_from) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->date_to) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            // Client name filter
            if ($request->client) {
                $query->whereHas('client', function($q) use ($request) {
                    $q->where('first_name', 'like', '%' . $request->client . '%')
                      ->orWhere('last_name', 'like', '%' . $request->client . '%')
                      ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ['%' . $request->client . '%']);
                });
            }

            // Service category filter
            if ($request->service_category) {
                $query->whereHas('service.category', function($q) use ($request) {
                    $q->where('slug', $request->service_category)
                      ->orWhere('name', 'like', '%' . $request->service_category . '%');
                });
            }

            // Price range filters
            if ($request->price_min) {
                $query->where('quoted_price', '>=', $request->price_min);
            }

            if ($request->price_max) {
                $query->where('quoted_price', '<=', $request->price_max);
            }

            // Sorting
            $sortField = $request->get('sort_field', 'created_at');
            $sortDirection = $request->get('sort_direction', 'desc');
            
            // Handle special sort fields that might need joins
            if ($sortField === 'client_name') {
                $query->leftJoin('users as clients', 'quotes.client_id', '=', 'clients.id')
                      ->orderByRaw("CONCAT(clients.first_name, ' ', clients.last_name) {$sortDirection}")
                      ->select('quotes.*');
            } elseif ($sortField === 'service_title') {
                $query->leftJoin('services', 'quotes.service_id', '=', 'services.id')
                      ->orderBy('services.title', $sortDirection)
                      ->select('quotes.*');
            } else {
                $query->orderBy($sortField, $sortDirection);
            }

            $perPage = $request->get('per_page', 15);
            $quotes = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $quotes
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch quotes: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch quotes'
            ], 500);
        }
    }

    /**
     * Get specific quote
     */
    public function show(Quote $quote)
    {
        if ($quote->provider_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Quote not found'
            ], 404);
        }

        $quote->load(['client', 'service']);

        return response()->json([
            'success' => true,
            'data' => $quote
        ]);
    }

    /**
     * Update quote with provider response
     */
    public function update(Request $request, Quote $quote)
    {
        $request->validate([
            'quoted_price' => 'required|numeric|min:1|max:1000000',
            'estimated_duration' => 'required|numeric|min:0.5|max:24',
            'quote_description' => 'required|string|min:20|max:1000',
            'validity_days' => 'nullable|integer|min:1|max:30',
            'terms_conditions' => 'nullable|string|max:2000',
            'includes_materials' => 'boolean',
            'travel_charges' => 'nullable|numeric|min:0',
            'additional_notes' => 'nullable|string|max:500'
        ]);

        if ($quote->provider_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        if (!in_array($quote->status, ['pending', 'quoted'])) {
            return response()->json([
                'success' => false,
                'message' => 'This quote cannot be updated'
            ], 400);
        }

        try {
            $quote->update([
                'quoted_price' => $request->quoted_price,
                'duration_hours' => $request->estimated_duration,
                'travel_fee' => $request->travel_charges ?? 0,
                'quote_details' => $request->quote_description,
                'terms_and_conditions' => $request->terms_conditions,
                'pricing_breakdown' => [
                    'base_price' => $request->quoted_price,
                    'travel_charges' => $request->travel_charges ?? 0,
                    'includes_materials' => $request->boolean('includes_materials'),
                    'additional_notes' => $request->additional_notes,
                ],
                'status' => 'quoted', // Mark as quoted when updated
                'valid_until' => now()->addDays($request->validity_days ?? 7),
                'responded_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Quote sent successfully',
                'data' => $quote->fresh(['client', 'service'])
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update quote: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update quote'
            ], 500);
        }
    }

    /**
     * Withdraw quote
     */
    public function withdraw(Request $request, Quote $quote)
    {
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        if ($quote->provider_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        if (!$quote->canBeWithdrawn()) {
            return response()->json([
                'success' => false,
                'message' => 'Quote cannot be withdrawn'
            ], 400);
        }

        try {
            $quote->withdraw($request->reason);

            return response()->json([
                'success' => true,
                'message' => 'Quote withdrawn successfully',
                'data' => $quote->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to withdraw quote: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to withdraw quote'
            ], 500);
        }
    }

    /**
     * Send a quote (change status from pending to quoted) - for pending quotes
     */
    public function send(Quote $quote)
    {
        if ($quote->provider_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        if ($quote->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending quotes can be sent'
            ], 400);
        }

        try {
            $quote->update([
                'status' => 'quoted',
                'responded_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Quote sent successfully',
                'data' => $quote->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send quote: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to send quote'
            ], 500);
        }
    }

    /**
     * This endpoint is not needed for direct quotes since clients create the initial request
     * But keeping for compatibility
     */
    public function store(Request $request)
    {
        return response()->json([
            'success' => false,
            'message' => 'Quotes are created by clients. You can only respond to existing quote requests.'
        ], 400);
    }

    /**
     * Get quotes awaiting provider response (pending quotes)
     */
    public function getAvailableRequests(Request $request)
    {
        try {
            $user = Auth::user();

            // Get pending quotes for this provider
            $quotes = Quote::where('provider_id', $user->id)
                ->where('status', 'pending')
                ->with(['client', 'service'])
                ->orderBy('created_at', 'desc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $quotes
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load pending quotes: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to load pending quotes'
            ], 500);
        }
    }

    /**
     * Get service categories for filtering
     */
    public function getServiceCategories()
    {
        try {
            $categories = \App\Models\ServiceCategory::active()
                ->ordered()
                ->select('id', 'name', 'slug')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load service categories: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to load service categories'
            ], 500);
        }
    }
}
