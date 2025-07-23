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
        <div className="container-custom px-4 px-md-6 py-5 mx-auto" style="max-width: 600px;">
            <h2 className="mb-4 text-xl md:text-2xl font-semibold text-primary">File Upload Test</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-5">
                    <label className="form-label">Profile Picture:</label>
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="form-control mt-2"
                    />
                </div>
                
                {file && (
                    <div className="mb-5">
                        <h3 className="text-lg font-semibold mb-3 text-secondary">File Info:</h3>
                        <div className="bg-light p-3 rounded">
                            <p className="mb-2 text-sm"><strong>Name:</strong> {file.name}</p>
                            <p className="mb-2 text-sm"><strong>Type:</strong> {file.type}</p>
                            <p className="mb-0 text-sm"><strong>Size:</strong> {file.size} bytes</p>
                        </div>
                    </div>
                )}
                
                <button 
                    type="submit" 
                    disabled={!file}
                    className="btn btn-primary w-100 w-md-auto"
                >
                    Test Upload
                </button>
            </form>
            
            {response && (
                <div className={`mt-5 p-4 rounded ${response.success ? 'alert alert-success' : 'alert alert-danger'}`}>
                    <h3 className="text-lg font-semibold mb-3">Response:</h3>
                    <pre className="text-xs text-sm overflow-auto">{JSON.stringify(response, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default TestFileUpload;
