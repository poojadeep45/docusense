import { useState } from 'react'

export default function DocumentCard({ doc, onAnalyze, onDelete }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="doc-card">
      <div className="doc-head" onClick={() => setOpen((v) => !v)}>
        <span className="filetype-tag">{doc.fileType}</span>
        <span className="doc-name">{doc.fileName}</span>
        <span className="doc-meta">{doc.category ? doc.category.catName : ''}</span>
        <span className={`stamp ${doc.status}`}>{doc.status}</span>
      </div>

      <div className={`doc-body ${open ? 'open' : ''}`}>
        <div className={`summary-text ${doc.summary ? '' : 'empty'}`}>
          {doc.summary || 'No summary yet — click Analyze to generate one.'}
        </div>
        <div className="doc-actions">
          <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); onAnalyze(doc.docId) }}>
            Analyze
          </button>
          <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); onDelete(doc.docId) }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
