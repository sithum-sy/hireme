<?php

namespace App\Http\Controllers\API\Provider;

use App\Http\Controllers\Controller;
use App\Models\Quote;
use App\Http\Requests\QuoteRequest;
use App\Services\AppointmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class QuoteController extends Controller
{
    protected $appointmentService;

    public function __construct(AppointmentService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }

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
            $filters = $request->only(['status']);

            $query = $this->appointmentService->getQuotes($user, $filters);
            $perPage = $request->get('per_page', 15);
            $quotes = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $quotes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch quotes'
            ], 500);
        }
    }

    /**
     * Create new quote
     */
    public function store(QuoteRequest $request)
    {
        try {
            $quote = $this->appointmentService->createQuote(Auth::user(), $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Quote sent successfully',
                'data' => $quote
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create quote'
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
     * Withdraw quote
     */
    public function withdraw(Request $request, Quote $quote)
    {
        $request->validate([
            'reason' => 'nullable|string|max:500'
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
            return response()->json([
                'success' => false,
                'message' => 'Failed to withdraw quote'
            ], 500);
        }
    }

    /**
     * Update existing quote (for draft quotes)
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

        if ($quote->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only draft quotes can be updated'
            ], 400);
        }

        try {
            $quote->update([
                'quoted_price' => $request->quoted_price,
                'estimated_duration' => $request->estimated_duration,
                'quote_description' => $request->quote_description,
                'validity_days' => $request->validity_days ?? 7,
                'terms_conditions' => $request->terms_conditions,
                'includes_materials' => $request->boolean('includes_materials'),
                'travel_charges' => $request->travel_charges ?? 0,
                'additional_notes' => $request->additional_notes,
                'expires_at' => now()->addDays($request->validity_days ?? 7),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Quote updated successfully',
                'data' => $quote->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update quote'
            ], 500);
        }
    }

    /**
     * Get available service requests for quoting
     */
    public function getAvailableRequests(Request $request)
    {
        try {
            $user = Auth::user();

            // Get quote requests that:
            // 1. Match provider's service categories
            // 2. Are in pending status
            // 3. Provider hasn't already quoted on
            // 4. Are within provider's service areas

            $requests = QuoteRequest::where('status', 'pending')
                ->whereDoesntHave('quotes', function ($query) use ($user) {
                    $query->where('provider_id', $user->id);
                })
                ->with(['client', 'service'])
                ->orderBy('created_at', 'desc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $requests
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load available requests'
            ], 500);
        }
    }

    /**
     * Send a quote (change status from pending to quoted)
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
                'message' => 'Only draft quotes can be sent'
            ], 400);
        }

        try {
            $quote->update([
                'status' => 'quoted',
                'sent_at' => now()
            ]);

            // Here you would typically:
            // 1. Send notification to client
            // 2. Send email notification
            // 3. Log the activity

            return response()->json([
                'success' => true,
                'message' => 'Quote sent successfully',
                'data' => $quote->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send quote'
            ], 500);
        }
    }
}
