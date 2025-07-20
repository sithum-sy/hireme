<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateProviderProfileRequest;
use App\Http\Requests\Profile\UploadDocumentsRequest;
use App\Services\ProviderProfileService;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProviderProfileController extends Controller
{
    protected ProviderProfileService $providerService;
    protected FileUploadService $fileUploadService;

    public function __construct(
        ProviderProfileService $providerService,
        FileUploadService $fileUploadService
    ) {
        $this->providerService = $providerService;
        $this->fileUploadService = $fileUploadService;

        // Ensure only service providers can access
        $this->middleware('role:service_provider');
    }

    /**
     * Get provider profile data
     */
    public function show(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $providerData = $this->providerService->getProviderProfile($user);

            return response()->json([
                'success' => true,
                'data' => $providerData,
                'message' => 'Provider profile retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve provider profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update provider profile
     */
    public function update(UpdateProviderProfileRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $data = $request->validated();

            $updatedProfile = $this->providerService->updateProviderProfile($user, $data);

            return response()->json([
                'success' => true,
                'data' => $updatedProfile,
                'message' => 'Provider profile updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update provider profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle availability status
     */
    public function toggleAvailability(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $providerProfile = $user->providerProfile;

            if (!$providerProfile) {
                return response()->json([
                    'success' => false,
                    'message' => 'Provider profile not found'
                ], 404);
            }

            $newStatus = !$providerProfile->is_available;
            $providerProfile->update(['is_available' => $newStatus]);

            // Log availability change
            activity()
                ->performedOn($providerProfile)
                ->causedBy($user)
                ->withProperties([
                    'action' => 'availability_toggled',
                    'new_status' => $newStatus
                ])
                ->log('Availability status changed');

            return response()->json([
                'success' => true,
                'data' => [
                    'is_available' => $newStatus
                ],
                'message' => 'Availability status updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update availability status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload documents
     */
    public function uploadDocuments(UploadDocumentsRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $data = $request->validated();

            $uploadedDocuments = $this->fileUploadService->uploadProviderDocuments(
                $user,
                $data
            );

            return response()->json([
                'success' => true,
                'data' => $uploadedDocuments,
                'message' => 'Documents uploaded successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload documents',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete document
     */
    public function deleteDocument(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $documentType = $request->input('type');
            $index = $request->input('index');

            $this->fileUploadService->deleteProviderDocument(
                $user,
                $documentType,
                $index
            );

            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete document',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get provider statistics
     */
    public function getStatistics(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $statistics = $this->providerService->getProviderStatistics($user);

            return response()->json([
                'success' => true,
                'data' => $statistics,
                'message' => 'Provider statistics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve provider statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
