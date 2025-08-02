<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\InAppNotification;
use App\Models\NotificationPreference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    /**
     * Get user's notifications with pagination
     */
    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'nullable|integer|min:1|max:50',
            'type' => 'nullable|string',
            'category' => 'nullable|string',
            'unread_only' => 'nullable',
            'read_only' => 'nullable'
        ]);

        try {
            $query = InAppNotification::where('user_id', Auth::id())
                ->orderBy('created_at', 'desc');

            // Filter by type if provided
            if ($request->type) {
                $query->where('type', $request->type);
            }

            // Filter by category if provided
            if ($request->category) {
                $query->where('category', $request->category);
            }

            // Filter unread only if requested
            if ($request->boolean('unread_only')) {
                $query->unread();
            }
            
            // Filter read only if requested
            if ($request->boolean('read_only')) {
                $query->read();
            }

            $perPage = $request->get('per_page', 15);
            $notifications = $query->paginate($perPage);

            // Get notification counts for stats
            $totalCount = InAppNotification::where('user_id', Auth::id())->count();
            $unreadCount = InAppNotification::where('user_id', Auth::id())->unread()->count();
            $readCount = InAppNotification::where('user_id', Auth::id())->read()->count();

            return response()->json([
                'success' => true,
                'data' => $notifications,
                'meta' => [
                    'total_count' => $totalCount,
                    'unread_count' => $unreadCount,
                    'read_count' => $readCount
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Notifications fetch failed:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch notifications'
            ], 500);
        }
    }

    /**
     * Get unread notification count
     */
    public function unreadCount()
    {
        try {
            $count = InAppNotification::where('user_id', Auth::id())
                ->unread()
                ->count();

            return response()->json([
                'success' => true,
                'data' => ['count' => $count]
            ]);
        } catch (\Exception $e) {
            Log::error('Unread count fetch failed:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch unread count'
            ], 500);
        }
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(InAppNotification $notification)
    {
        // Ensure user owns this notification
        if ($notification->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found'
            ], 404);
        }

        try {
            $notification->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read',
                'data' => $notification->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Mark as read failed:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notification as read'
            ], 500);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        try {
            InAppNotification::where('user_id', Auth::id())
                ->unread()
                ->update(['is_read' => true]);

            return response()->json([
                'success' => true,
                'message' => 'All notifications marked as read'
            ]);
        } catch (\Exception $e) {
            Log::error('Mark all as read failed:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark all notifications as read'
            ], 500);
        }
    }

    /**
     * Delete notification
     */
    public function destroy(InAppNotification $notification)
    {
        // Ensure user owns this notification
        if ($notification->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found'
            ], 404);
        }

        try {
            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notification deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Notification deletion failed:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete notification'
            ], 500);
        }
    }

    /**
     * Get user's notification preferences
     */
    public function getPreferences()
    {
        try {
            $user = Auth::user();
            $preferences = $user->notificationPreference;

            // Create default preferences if they don't exist
            if (!$preferences) {
                $preferences = NotificationPreference::create([
                    'user_id' => $user->id,
                    'email_enabled' => true,
                    'app_enabled' => true,
                    'sms_enabled' => false,
                    'appointment_reminders' => true,
                    'status_updates' => true,
                    'marketing_emails' => true,
                    'invoice_notifications' => true
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $preferences
            ]);
        } catch (\Exception $e) {
            Log::error('Preferences fetch failed:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch notification preferences'
            ], 500);
        }
    }

    /**
     * Update notification preferences
     */
    public function updatePreferences(Request $request)
    {
        $request->validate([
            'email_enabled' => 'boolean',
            'app_enabled' => 'boolean',
            'sms_enabled' => 'boolean',
            'appointment_reminders' => 'boolean',
            'status_updates' => 'boolean',
            'marketing_emails' => 'boolean',
            'invoice_notifications' => 'boolean'
        ]);

        try {
            $user = Auth::user();
            $preferences = $user->notificationPreference;

            if (!$preferences) {
                $preferences = NotificationPreference::create([
                    'user_id' => $user->id
                ]);
            }

            $preferences->update($request->only([
                'email_enabled',
                'app_enabled', 
                'sms_enabled',
                'appointment_reminders',
                'status_updates',
                'marketing_emails',
                'invoice_notifications'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Notification preferences updated successfully',
                'data' => $preferences->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Preferences update failed:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update notification preferences'
            ], 500);
        }
    }

    /**
     * Get recent notifications for dashboard
     */
    public function recent()
    {
        try {
            $notifications = InAppNotification::where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $notifications
            ]);
        } catch (\Exception $e) {
            Log::error('Recent notifications fetch failed:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch recent notifications'
            ], 500);
        }
    }
}