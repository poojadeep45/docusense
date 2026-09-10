import React from 'react';
import DocumentCard from './DocumentCard.jsx';

export default function DocumentList({ docs, tags, onAnalyze, onDelete, onAddTag }) {
  if (!docs.length) {
    return (
      <div className="empty-state">
        <div className="icon">🗂️</div>
        <p>No documents yet.</p>
        <p>Upload one above to get started.</p>
      </div>
    );
  }

  return (
    <div>
      {docs.map((d) => (
        <DocumentCard
          key={d.docId}
          doc={d}
          allTags={tags}
          onAnalyze={onAnalyze}
          onDelete={onDelete}
          onAddTag={onAddTag}
        />
      ))}
    </div>
  );
}