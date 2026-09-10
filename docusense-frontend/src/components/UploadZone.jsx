import React, { useRef, useState } from 'react';

export default function UploadZone({ categories, selectedCategory, onSelectCategory, onUpload }) {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  function handleFiles(fileList) {
    const files = Array.from(fileList);
    if (files.length) onUpload(files);
  }

  return (
    <div
      className={`dropzone ${dragging ? 'drag' : ''}`}
      onClick={() => fileInputRef.current.click()}
      onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <div className="icon">📄</div>
      <div className="dropzone-text">
        <strong>Drop one or more files here, or click to browse</strong>
        <span>PDF, DOCX, or TXT</span>
      </div>
      <select
        className="category-select"
        value={selectedCategory || ''}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onSelectCategory(e.target.value)}
      >
        <option value="">No category</option>
        {categories.map((c) => (
          <option key={c.catId} value={c.catId}>{c.catName}</option>
        ))}
      </select>
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.docx,.txt"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}