<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use App\Http\Controllers\Controller;

/**
 * PaymentController - Stripe payment integration for appointment payments
 * 
 * Handles secure payment processing using Stripe Payment Intents API.
 * Creates payment intents for appointments with proper error handling,
 * logging, and security measures for financial transactions.
 */
class PaymentController extends Controller
{
    /**
     * Create Stripe Payment Intent for appointment payment
     * Implements secure payment initialization with comprehensive error handling
     */
    public function createPaymentIntent(Request $request)
    {
        try {
            // Initialize Stripe with secret key from environment
            Stripe::setApiKey(env('STRIPE_SECRET'));

            // Validate payment request data
            $request->validate([
                'amount' => 'required|numeric|min:1',
                'appointment_id' => 'required|exists:appointments,id',
            ]);

            // Log payment attempt for security and debugging
            Log::info('Creating payment intent', [
                'amount' => $request->amount,
                'appointment_id' => $request->appointment_id,
            ]);

            // Create Stripe Payment Intent with metadata for tracking
            $paymentIntent = PaymentIntent::create([
                'amount' => $request->amount, // Amount in smallest currency unit (cents/paise)
                'currency' => 'lkr', // Sri Lankan Rupee
                'metadata' => [
                    'appointment_id' => $request->appointment_id,
                ],
                'automatic_payment_methods' => [
                    'enabled' => true, // Enable all available payment methods
                ],
            ]);

            Log::info('Payment intent created successfully', [
                'payment_intent_id' => $paymentIntent->id,
                'client_secret' => $paymentIntent->client_secret,
            ]);

            return response()->json([
                'success' => true,
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
            ]);
        } catch (\Stripe\Exception\ApiErrorException $e) {
            // Handle Stripe-specific API errors (card declined, invalid parameters, etc.)
            Log::error('Stripe API error', [
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Payment system error: ' . $e->getMessage(),
            ], 500);
        } catch (\Exception $e) {
            // Handle general application errors
            Log::error('General error creating payment intent', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to initialize payment: ' . $e->getMessage(),
            ], 500);
        }
    }
}
