import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import Modal from './Modal.jsx';

export default function UploadModal({ categories, onClose, onUpload }) {
  const [dragging, setDragging] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [pendingFiles, setPendingFiles] = useState([]);
  const fileInputRef = useRef(null);

  function addFiles(fileList) {
    setPendingFiles((prev) => [...prev, ...Array.from(fileList)]);
  }

  function removeFile(idx) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function submit() {
    if (!pendingFiles.length) return;
    await onUpload(pendingFiles, categoryId || null);
    onClose();
  }

  return (
    <Modal title="Upload documents" onClose={onClose} width="520px">
      <div
        className={`upload-drop ${dragging ? 'drag' : ''}`}
        onClick={() => fileInputRef.current.click()}
        onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
      >
        <UploadCloud size={26} strokeWidth={1.5} />
        <p><strong>Click to browse</strong> or drag files here</p>
        <span className="upload-drop-hint">PDF, DOCX, or TXT — multiple allowed</span>
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.docx,.txt"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {pendingFiles.length > 0 && (
        <ul className="upload-file-list">
          {pendingFiles.map((f, idx) => (
            <li key={idx}>
              <span>{f.name}</span>
              <button onClick={() => removeFile(idx)}>Remove</button>
            </li>
          ))}
        </ul>
      )}

      <label className="field-label">Category (optional)</label>
      <select className="field-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        <option value="">No category</option>
        {categories.map((c) => (
          <option key={c.catId} value={c.catId}>{c.catName}</option>
        ))}
      </select>

      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" disabled={!pendingFiles.length} onClick={submit}>
          Upload {pendingFiles.length > 0 ? `(${pendingFiles.length})` : ''}
        </button>
      </div>
    </Modal>
  );
}