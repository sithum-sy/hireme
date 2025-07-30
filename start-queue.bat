@echo off
echo Starting Laravel Queue Worker...
echo.
echo This will process queued jobs in the background
echo Press Ctrl+C to stop the worker
echo.
php artisan queue:work --daemon --sleep=3 --tries=3 --timeout=90