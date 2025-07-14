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
}
