// Profile Debug Utility
// Add to window for debugging
window.profileDebugInterval = setInterval(() => {
    console.log('⏰ INTERVAL CHECK - Profile Context State:', {
        timestamp: new Date().toISOString(),
        documentTitle: document.title,
        activeElement: document.activeElement?.tagName,
        visibilityState: document.visibilityState,
        profileImages: Array.from(document.querySelectorAll('img[alt*="Profile"], .profile-preview')).map(img => ({
            src: img.src,
            alt: img.alt,
            className: img.className
        }))
    });
}, 10000); // Every 10 seconds

// Clear interval when debugging is done
// clearInterval(window.profileDebugInterval);

console.log('🐛 Profile debugging interval started. Run clearInterval(window.profileDebugInterval) to stop.');
