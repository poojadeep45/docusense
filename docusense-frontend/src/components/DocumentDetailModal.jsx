import React from 'react';
import Modal from './Modal.jsx';
import StatusBadge from './StatusBadge.jsx';

export default function DocumentDetailModal({ doc, allTags, onClose, onAnalyze, onAddTag }) {
  const assignedIds = new Set((doc.tags || []).map((t) => t.tagId));

  return (
    <Modal title={doc.fileName} onClose={onClose} width="560px">
      <div className="detail-meta-row">
        <span className="filetype-tag">{doc.fileType}</span>
        <StatusBadge status={doc.status} />
        {doc.category && <span className="detail-category">{doc.category.catName}</span>}
      </div>

      <div className="detail-section-label">Summary</div>
      <div className={`summary-text ${doc.summary ? '' : 'empty'}`}>
        {doc.summary || 'No summary yet — click Analyze to generate one.'}
      </div>

      <div className="detail-section-label">Tags</div>
      <div className="tag-picker-grid">
        {allTags.length === 0 && <span className="doc-meta">No tags created yet.</span>}
        {allTags.map((t) => {
          const assigned = assignedIds.has(t.tagId);
          return (
            <span
              key={t.tagId}
              className={`chip ${assigned ? 'assigned' : ''}`}
              onClick={() => { if (!assigned) onAddTag(doc.docId, t.tagId); }}
            >
              {t.tagName}{assigned ? ' ✓' : ''}
            </span>
          );
        })}
      </div>

      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose}>Close</button>
        <button className="btn-primary" onClick={() => onAnalyze(doc.docId)}>Analyze</button>
      </div>
    </Modal>
  );
}