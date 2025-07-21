<?php
// Simple PHP info to check file upload settings
echo "PHP File Upload Settings:\n";
echo "file_uploads: " . (ini_get('file_uploads') ? 'On' : 'Off') . "\n";
echo "upload_max_filesize: " . ini_get('upload_max_filesize') . "\n";
echo "post_max_size: " . ini_get('post_max_size') . "\n";
echo "max_file_uploads: " . ini_get('max_file_uploads') . "\n";
echo "max_execution_time: " . ini_get('max_execution_time') . "\n";
echo "max_input_time: " . ini_get('max_input_time') . "\n";
echo "memory_limit: " . ini_get('memory_limit') . "\n";

echo "\nGD Extension: " . (extension_loaded('gd') ? 'Loaded' : 'Not Loaded') . "\n";

if (extension_loaded('gd')) {
    $gd_info = gd_info();
    echo "GD Version: " . $gd_info['GD Version'] . "\n";
    echo "JPEG Support: " . ($gd_info['JPEG Support'] ? 'Yes' : 'No') . "\n";
    echo "PNG Support: " . ($gd_info['PNG Support'] ? 'Yes' : 'No') . "\n";
    echo "GIF Support: " . ($gd_info['GIF Create Support'] ? 'Yes' : 'No') . "\n";
}

echo "\nFileinfo Extension: " . (extension_loaded('fileinfo') ? 'Loaded' : 'Not Loaded') . "\n";

// Test file type detection
if (extension_loaded('fileinfo')) {
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    echo "Fileinfo working: Yes\n";
} else {
    echo "Fileinfo working: No\n";
}
?>
