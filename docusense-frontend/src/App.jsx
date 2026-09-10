import React, { useCallback, useEffect, useRef, useState } from 'react';
import { auth, documents as docsApi, categories as categoriesApi, tags as tagsApi, SessionExpiredError } from './api.js';
import TopBar from './components/TopBar.jsx';
import AuthView from './components/AuthView.jsx';
import UploadZone from './components/UploadZone.jsx';
import OrganizePanel from './components/OrganizePanel.jsx';
import DocumentList from './components/DocumentList.jsx';
import Toast from './components/Toast.jsx';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('docusense_token'));
  const [username, setUsername] = useState(localStorage.getItem('docusense_username'));

  const [docs, setDocs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [activeFilter, setActiveFilter] = useState({ type: null, id: null, label: null });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const pollRef = useRef(null);
  const searchDebounceRef = useRef(null);

  const showToast = useCallback((msg) => setToastMessage(msg), []);

  const logout = useCallback(() => {
    localStorage.removeItem('docusense_token');
    localStorage.removeItem('docusense_username');
    setToken(null);
    setUsername(null);
    clearInterval(pollRef.current);
  }, []);

  const handleApiError = useCallback((err) => {
    if (err instanceof SessionExpiredError) {
      logout();
      showToast('Session expired.');
    } else {
      showToast(err.message);
    }
  }, [logout, showToast]);

  const loadDocuments = useCallback(async () => {
    try {
      const data = await docsApi.list(activeFilter.type ? activeFilter : null);
      setDocs(data);
    } catch (err) {
      if (err instanceof SessionExpiredError) logout();
      /* stay silent on background poll errors otherwise */
    }
  }, [activeFilter, logout]);

  const loadCategories = useCallback(async () => {
    try {
      setCategories(await categoriesApi.list());
    } catch (err) { handleApiError(err); }
  }, [handleApiError]);

  const loadTags = useCallback(async () => {
    try {
      setTags(await tagsApi.list());
    } catch (err) { handleApiError(err); }
  }, [handleApiError]);

  // Initial load + polling once authenticated
  useEffect(() => {
    if (!token) return;
    loadCategories();
    loadTags();
    loadDocuments();
    clearInterval(pollRef.current);
    pollRef.current = setInterval(loadDocuments, 5000);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Re-fetch documents whenever the active filter changes
  useEffect(() => {
    if (!token) return;
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  async function handleLogin(u, password) {
    const data = await auth.login(u, password);
    token && clearInterval(pollRef.current);
    localStorage.setItem('docusense_token', data.token);
    localStorage.setItem('docusense_username', u);
    setToken(data.token);
    setUsername(u);
  }

  async function handleRegister(u, password, email) {
    const data = await auth.register(u, password, email);
    localStorage.setItem('docusense_token', data.token);
    localStorage.setItem('docusense_username', u);
    setToken(data.token);
    setUsername(u);
  }

  async function handleUpload(files) {
    try {
      const categoryId = selectedCategory || null;
      if (files.length === 1) {
        showToast('Uploading…');
        await docsApi.upload(files[0], categoryId);
        showToast('Uploaded — analyzing next is optional.');
      } else {
        showToast(`Uploading ${files.length} files…`);
        await docsApi.uploadBatch(files, categoryId);
        showToast(`Uploaded ${files.length} files.`);
      }
      loadDocuments();
    } catch (err) { handleApiError(err); }
  }

  async function handleAnalyze(id) {
    try {
      await docsApi.analyze(id);
      showToast('Analysis started…');
      loadDocuments();
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
      loadDocuments();
    } catch (err) { handleApiError(err); }
  }

  async function handleCreateCategory(name) {
    try {
      await categoriesApi.create(name);
      showToast('Category added.');
      loadCategories();
    } catch (err) { handleApiError(err); }
  }

  async function handleCreateTag(name) {
    try {
      await tagsApi.create(name);
      showToast('Tag added.');
      loadTags();
    } catch (err) { handleApiError(err); }
  }

  function filterByCategory(id, name) {
    setSearchValue('');
    setActiveFilter({ type: 'category', id, label: `Category: ${name}` });
  }

  function filterByTag(id, name) {
    setSearchValue('');
    setActiveFilter({ type: 'tag', id, label: `Tag: ${name}` });
  }

  function clearFilter() {
    setSearchValue('');
    setActiveFilter({ type: null, id: null, label: null });
  }

  function handleSearchChange(value) {
    setSearchValue(value);
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      if (!value.trim()) {
        setActiveFilter({ type: null, id: null, label: null });
      } else {
        setActiveFilter({ type: 'search', id: value.trim(), label: `Search: "${value.trim()}"` });
      }
    }, 350);
  }

  return (
    <>
      <TopBar username={token ? username : null} onLogout={logout} />
      <main>
        {!token ? (
          <AuthView onLogin={handleLogin} onRegister={handleRegister} />
        ) : (
          <>
            <h1 className="hero"><span className="hero-mark">Your documents,</span><br />understood.</h1>
            <p className="sub">Upload a file — DocuSense reads it and hands you the summary.</p>

            <div className="section-label">Upload</div>
            <UploadZone
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onUpload={handleUpload}
            />

            <div className="section-label">Organize</div>
            <OrganizePanel
              categories={categories}
              tags={tags}
              activeFilter={activeFilter}
              onFilterCategory={filterByCategory}
              onFilterTag={filterByTag}
              onClearFilter={clearFilter}
              onCreateCategory={handleCreateCategory}
              onCreateTag={handleCreateTag}
            />

            <div className="section-row">
              <div className="section-label">Your documents</div>
              <input
                type="text"
                className="search-input"
                placeholder="Search by file name…"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            {activeFilter.type && (
              <div className="filter-banner">
                <span>Showing: {activeFilter.label}</span>
                <button onClick={clearFilter}>Clear</button>
              </div>
            )}

            <DocumentList
              docs={docs}
              tags={tags}
              onAnalyze={handleAnalyze}
              onDelete={handleDelete}
              onAddTag={handleAddTag}
            />
          </>
        )}
      </main>
      <Toast message={toastMessage} onDone={() => setToastMessage('')} />
    </>
  );
}