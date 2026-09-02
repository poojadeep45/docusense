import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentsAPI, categoriesAPI } from '../services/api';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch categories on mount
  useState(() => {
    categoriesAPI.getAll()
      .then(response => setCategories(response.data))
      .catch(err => console.error('Failed to load categories:', err));
  });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF, DOCX, or TXT file');
      return;
    }
    setFile(selectedFile);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    if (categoryId) {
      formData.append('categoryId', categoryId);
    }

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await documentsAPI.upload(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Navigate to document details after short delay
      setTimeout(() => {
        navigate(`/documents/${response.data.docId}`);
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f5f7fa',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            color: '#667eea',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Back to Dashboard
        </button>

        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ 
            marginBottom: '30px', 
            color: '#333',
            fontSize: '32px',
            fontWeight: 'bold'
          }}>
            Upload Document
          </h1>

          {error && (
            <div style={{
              background: '#fee',
              color: '#c33',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '24px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* File Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragActive ? '#667eea' : '#ddd'}`,
                borderRadius: '8px',
                padding: '40px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragActive ? '#f0f4ff' : '#fafafa',
                marginBottom: '24px',
                transition: 'all 0.2s'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.docx,.txt"
                style={{ display: 'none' }}
              />
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
              {file ? (
                <div>
                  <p style={{ 
                    color: '#333', 
                    fontSize: '16px',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    {file.name}
                  </p>
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ 
                    color: '#333', 
                    fontSize: '16px',
                    marginBottom: '8px'
                  }}>
                    Drag and drop your file here, or click to browse
                  </p>
                  <p style={{ color: '#999', fontSize: '14px' }}>
                    Supports PDF, DOCX, and TXT files
                  </p>
                </div>
              )}
            </div>

            {/* Category Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: '#555',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Category (optional)
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  background: 'white'
                }}
              >
                <option value="">No category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e0e0e0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${uploadProgress}%`,
                    height: '100%',
                    background: '#667eea',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || uploading}
              style={{
                width: '100%',
                padding: '14px',
                background: (!file || uploading) ? '#999' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: (!file || uploading) ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;