import React, { useState } from 'react';

export default function DocumentCard({ doc, allTags, onAnalyze, onDelete, onAddTag }) {
  const [open, setOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const assignedIds = new Set((doc.tags || []).map((t) => t.tagId));

  return (
    <div className="doc-card">
      <div className="doc-head" onClick={() => setOpen(!open)}>
        <span className="filetype-tag">{doc.fileType}</span>
        <span className="doc-name">{doc.fileName}</span>
        <span className="doc-meta">{doc.category ? doc.category.catName : ''}</span>
        <span className={`stamp ${doc.status}`}>{doc.status}</span>
      </div>

      <div className={`doc-body ${open ? 'open' : ''}`}>
        <div className={`summary-text ${doc.summary ? '' : 'empty'}`}>
          {doc.summary || 'No summary yet — click Analyze to generate one.'}
        </div>

        {doc.tags && doc.tags.length > 0 && (
          <div className="doc-tags">
            {doc.tags.map((t) => (
              <span className="tag-pill" key={t.tagId}>{t.tagName}</span>
            ))}
          </div>
        )}

        <div className="doc-actions">
          <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); onAnalyze(doc.docId); }}>
            Analyze
          </button>
          <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); setPickerOpen(!pickerOpen); }}>
            + Tag
          </button>
          <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); onDelete(doc.docId); }}>
            Delete
          </button>
        </div>

        <div className={`tag-picker ${pickerOpen ? 'open' : ''}`}>
          {allTags.length === 0 && <span className="doc-meta">No tags yet — add one above.</span>}
          {allTags.map((t) => {
            const assigned = assignedIds.has(t.tagId);
            return (
              <span
                key={t.tagId}
                className={`chip ${assigned ? 'assigned' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!assigned) onAddTag(doc.docId, t.tagId);
                }}
              >
                {t.tagName}{assigned ? ' ✓' : ''}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}