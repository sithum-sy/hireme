<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use App\Http\Controllers\Controller;

class PaymentController extends Controller
{
    public function createPaymentIntent(Request $request)
    {
        try {
            // Set your Stripe secret key
            Stripe::setApiKey(env('STRIPE_SECRET'));

            // Validate the request
            $request->validate([
                'amount' => 'required|numeric|min:1',
                'appointment_id' => 'required|exists:appointments,id',
            ]);

            // Log the request for debugging
            Log::info('Creating payment intent', [
                'amount' => $request->amount,
                'appointment_id' => $request->appointment_id,
            ]);

            // Create the payment intent
            $paymentIntent = PaymentIntent::create([
                'amount' => $request->amount, // Amount in cents
                'currency' => 'lkr', // Change to 'usd' if needed
                'metadata' => [
                    'appointment_id' => $request->appointment_id,
                ],
                'automatic_payment_methods' => [
                    'enabled' => true,
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
            Log::error('Stripe API error', [
                'error' => $e->getMessage(),
                // 'type' => $e->getType(),
                'code' => $e->getCode(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Payment system error: ' . $e->getMessage(),
            ], 500);
        } catch (\Exception $e) {
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
