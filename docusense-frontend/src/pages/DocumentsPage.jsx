import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FileText, Clock, CheckCircle2, XCircle, Plus, Search, Trash2, Tags as TagsIcon } from 'lucide-react';
import { documents as docsApi, categories as categoriesApi, tags as tagsApi, SessionExpiredError } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import TopHeader from '../components/TopHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import UploadModal from '../components/UploadModal.jsx';
import DocumentDetailModal from '../components/DocumentDetailModal.jsx';
import Toast from '../components/Toast.jsx';

export default function DocumentsPage() {
  const { logout } = useAuth();
  const [docs, setDocs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [activeFilter, setActiveFilter] = useState({ type: null, id: null });
  const [searchValue, setSearchValue] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const pollRef = useRef(null);
  const searchDebounceRef = useRef(null);

  const showToast = useCallback((msg) => setToastMessage(msg), []);

  const handleApiError = useCallback((err) => {
    if (err instanceof SessionExpiredError) { logout(); return; }
    showToast(err.message);
  }, [logout, showToast]);

  const loadDocuments = useCallback(async () => {
    try {
      const data = await docsApi.list(activeFilter.type ? activeFilter : null);
      setDocs(data);
    } catch (err) {
      if (err instanceof SessionExpiredError) logout();
    }
  }, [activeFilter, logout]);

  const loadCategories = useCallback(async () => {
    try { setCategories(await categoriesApi.list()); } catch (err) { handleApiError(err); }
  }, [handleApiError]);

  const loadTags = useCallback(async () => {
    try { setTags(await tagsApi.list()); } catch (err) { handleApiError(err); }
  }, [handleApiError]);

  useEffect(() => {
    loadCategories();
    loadTags();
    loadDocuments();
    clearInterval(pollRef.current);
    pollRef.current = setInterval(loadDocuments, 5000);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  async function handleUpload(files, categoryId) {
    try {
      if (files.length === 1) {
        showToast('Uploading…');
        await docsApi.upload(files[0], categoryId);
      } else {
        showToast(`Uploading ${files.length} files…`);
        await docsApi.uploadBatch(files, categoryId);
      }
      showToast('Upload complete.');
      loadDocuments();
    } catch (err) { handleApiError(err); }
  }

  async function handleAnalyze(id) {
    try {
      await docsApi.analyze(id);
      showToast('Analysis started…');
      loadDocuments();
      setActiveDoc(null);
    } catch (err) { handleApiError(err); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this document?')) return;
    try {
      await docsApi.remove(id);
      showToast('Document deleted.');
      loadDocuments();
    } catch (err) { handleApiError(err); }
  }

  async function handleAddTag(docId, tagId) {
    try {
      await docsApi.addTags(docId, [tagId]);
      showToast('Tag added.');
      const updated = await docsApi.list(activeFilter.type ? activeFilter : null);
      setDocs(updated);
      const refreshed = updated.find((d) => d.docId === docId);
      if (refreshed) setActiveDoc(refreshed);
    } catch (err) { handleApiError(err); }
  }

  function handleSearchChange(value) {
    setSearchValue(value);
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setActiveFilter(value.trim() ? { type: 'search', id: value.trim() } : { type: null, id: null });
    }, 350);
  }

  const counts = {
    total: docs.length,
    processing: docs.filter((d) => d.status === 'PROCESSING' || d.status === 'UPLOADED').length,
    completed: docs.filter((d) => d.status === 'COMPLETED').length,
    failed: docs.filter((d) => d.status === 'FAILED').length,
  };

  return (
    <>
      <TopHeader
        title="Documents"
        subtitle="Every file you've uploaded, its status, and its summary."
        actions={
          <button className="btn-primary" onClick={() => setUploadOpen(true)}>
            <Plus size={16} /> Upload
          </button>
        }
      />

      <div className="stat-row">
        <StatCard label="Total documents" value={counts.total} icon={FileText} tone="default" />
        <StatCard label="In progress" value={counts.processing} icon={Clock} tone="warning" />
        <StatCard label="Completed" value={counts.completed} icon={CheckCircle2} tone="success" />
        <StatCard label="Failed" value={counts.failed} icon={XCircle} tone="danger" />
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by file name…"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <select
          className="field-select toolbar-select"
          value={activeFilter.type === 'category' ? activeFilter.id : ''}
          onChange={(e) => {
            setSearchValue('');
            setActiveFilter(e.target.value ? { type: 'category', id: e.target.value } : { type: null, id: null });
          }}
        >
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.catId} value={c.catId}>{c.catName}</option>)}
        </select>

        <select
          className="field-select toolbar-select"
          value={activeFilter.type === 'tag' ? activeFilter.id : ''}
          onChange={(e) => {
            setSearchValue('');
            setActiveFilter(e.target.value ? { type: 'tag', id: e.target.value } : { type: null, id: null });
          }}
        >
          <option value="">All tags</option>
          {tags.map((t) => <option key={t.tagId} value={t.tagId}>{t.tagName}</option>)}
        </select>
      </div>

      <div className="table-card">
        {docs.length === 0 ? (
          <div className="empty-state">
            <FileText size={28} strokeWidth={1.5} />
            <p>No documents match this view.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Tags</th>
                <th>Status</th>
                <th aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.docId} className="data-row" onClick={() => setActiveDoc(d)}>
                  <td>
                    <div className="doc-name-cell">
                      <span className="filetype-tag">{d.fileType}</span>
                      <span>{d.fileName}</span>
                    </div>
                  </td>
                  <td>{d.category ? d.category.catName : <span className="muted">—</span>}</td>
                  <td>
                    {d.tags && d.tags.length > 0 ? (
                      <div className="table-tag-row">
                        {d.tags.slice(0, 3).map((t) => <span className="tag-pill" key={t.tagId}>{t.tagName}</span>)}
                        {d.tags.length > 3 && <span className="tag-pill more">+{d.tags.length - 3}</span>}
                      </div>
                    ) : <span className="muted">—</span>}
                  </td>
                  <td><StatusBadge status={d.status} /></td>
                  <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                    <button className="icon-btn" title="Manage tags" onClick={() => setActiveDoc(d)}>
                      <TagsIcon size={16} />
                    </button>
                    <button className="icon-btn danger" title="Delete" onClick={() => handleDelete(d.docId)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {uploadOpen && (
        <UploadModal categories={categories} onClose={() => setUploadOpen(false)} onUpload={handleUpload} />
      )}

      {activeDoc && (
        <DocumentDetailModal
          doc={activeDoc}
          allTags={tags}
          onClose={() => setActiveDoc(null)}
          onAnalyze={handleAnalyze}
          onAddTag={handleAddTag}
        />
      )}

      <Toast message={toastMessage} onDone={() => setToastMessage('')} />
    </>
  );
}