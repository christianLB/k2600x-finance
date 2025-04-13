'use client';

import { useState } from 'react';

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadStatus(null); // Clear previous status
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file.');
      return;
    }

    setUploadStatus('Uploading...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/file-upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadStatus(`File uploaded successfully: ${result.url}`); // Adjust based on your API response
        setSelectedFile(null); // Clear selected file
      } else {
        const errorBody = await response.json();
        setUploadStatus(`Upload failed: ${errorBody.error}`);
      }
    } catch (error: any) {
      setUploadStatus(`Upload failed: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">File Upload</h1>
      <div className="bg-white shadow-md rounded-lg p-8">
        <input type="file" onChange={handleFileChange} className="mb-4" />
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploadStatus === 'Uploading...'}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Upload
        </button>
        {uploadStatus && (
          <p className="mt-4 text-center">{uploadStatus}</p>
        )}
      </div>
    </div>
  );
};

export default UploadPage;