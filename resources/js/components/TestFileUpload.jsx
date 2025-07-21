// Test the file upload issue
import React, { useState } from 'react';

const TestFileUpload = () => {
    const [file, setFile] = useState(null);
    const [response, setResponse] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        console.log('File selected:', {
            name: selectedFile?.name,
            type: selectedFile?.type,
            size: selectedFile?.size
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!file) {
            alert('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('profile_picture', file);
        formData.append('first_name', 'Test');
        formData.append('last_name', 'User');
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');
        formData.append('password_confirmation', 'password123');
        formData.append('role', 'client');
        formData.append('address', 'Test Address');
        formData.append('contact_number', '1234567890');
        formData.append('date_of_birth', '1990-01-01');

        console.log('FormData contents:');
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`${key}:`, {
                    name: value.name,
                    type: value.type,
                    size: value.size
                });
            } else {
                console.log(`${key}:`, value);
            }
        }

        try {
            const response = await axios.post('/api/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            console.log('Success:', response.data);
            setResponse({ success: true, data: response.data });
        } catch (error) {
            console.error('Error:', error);
            setResponse({ 
                success: false, 
                error: error.response?.data || error.message 
            });
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>File Upload Test</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label>Profile Picture:</label>
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        style={{ display: 'block', marginTop: '5px' }}
                    />
                </div>
                
                {file && (
                    <div style={{ marginBottom: '20px' }}>
                        <h3>File Info:</h3>
                        <p>Name: {file.name}</p>
                        <p>Type: {file.type}</p>
                        <p>Size: {file.size} bytes</p>
                    </div>
                )}
                
                <button type="submit" disabled={!file}>
                    Test Upload
                </button>
            </form>
            
            {response && (
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: response.success ? '#d4edda' : '#f8d7da' }}>
                    <h3>Response:</h3>
                    <pre>{JSON.stringify(response, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default TestFileUpload;
