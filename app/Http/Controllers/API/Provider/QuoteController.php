<?php
// app/Http/Controllers/API/Provider/QuoteController.php

namespace App\Http\Controllers\API\Provider;

use App\Http\Controllers\Controller;
use App\Models\Quote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class QuoteController extends Controller
{
    /**
     * Get provider's quotes
     */
    public function index(Request $request)
    {
        $request->validate([
            'status' => 'nullable|in:pending,quoted,accepted,rejected,expired,withdrawn',
            'per_page' => 'nullable|integer|min:1|max:50'
        ]);

        try {
            $user = Auth::user();
            $query = Quote::where('provider_id', $user->id)
                ->with(['client', 'service']);

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

            $perPage = $request->get('per_page', 15);
            $quotes = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $quotes
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch quotes: ' . $e->getMessage());

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
            \Log::error('Failed to update quote: ' . $e->getMessage());

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
            \Log::error('Failed to withdraw quote: ' . $e->getMessage());

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
            \Log::error('Failed to send quote: ' . $e->getMessage());

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
            \Log::error('Failed to load pending quotes: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to load pending quotes'
            ], 500);
        }
    }
}
