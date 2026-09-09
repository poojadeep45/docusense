import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'
import Dropzone from '../components/Dropzone.jsx'
import DocumentCard from '../components/DocumentCard.jsx'

export default function Dashboard() {
  const { token, username, logout } = useAuth()
  const [docs, setDocs] = useState([])
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  function showToast(msg) {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2600)
  }

  const loadDocuments = useCallback(async () => {
    try {
      const data = await api.getDocuments(token)
      setDocs(data)
    } catch {
      // silent on background poll
    }
  }, [token])

  useEffect(() => {
    loadDocuments()
    const interval = setInterval(loadDocuments, 5000)
    return () => clearInterval(interval)
  }, [loadDocuments])

  async function handleUpload(file) {
    try {
      showToast('Uploading…')
      await api.uploadDocument(file, token)
      showToast('Uploaded — click Analyze when you\'re ready.')
      loadDocuments()
    } catch (err) {
      showToast(err.message)
    }
  }

  async function handleAnalyze(docId) {
    try {
      await api.analyzeDocument(docId, token)
      showToast('Analysis started…')
      loadDocuments()
    } catch (err) {
      showToast(err.message)
    }
  }

  async function handleDelete(docId) {
    if (!confirm('Delete this document?')) return
    try {
      await api.deleteDocument(docId, token)
      showToast('Document deleted.')
      loadDocuments()
    } catch (err) {
      showToast(err.message)
    }
  }

  return (
    <>
      <div className="topbar">
        <div className="brand"><span className="mark"></span>DocuSense</div>
        <div className="userbar">
          <span>{username}</span>
          <button className="btn-ghost" onClick={logout}>Log out</button>
        </div>
      </div>

      <main>
        <h1 className="hero">
          <span className="hero-mark">Your documents,</span>
          <br />
          understood.
        </h1>
        <p className="sub">Upload a file — DocuSense reads it and hands you the summary.</p>

        <div className="section-label">Upload</div>
        <Dropzone onFileSelected={handleUpload} />

        <div className="section-label">Your documents</div>
        <div>
          {docs.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🗂️</div>
              <p>No documents yet.</p>
              <p>Upload one above to get started.</p>
            </div>
          ) : (
            docs.map((doc) => (
              <DocumentCard
                key={doc.docId}
                doc={doc}
                onAnalyze={handleAnalyze}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </main>

      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </>
  )
}
