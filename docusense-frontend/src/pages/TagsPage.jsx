import React, { useEffect, useState } from 'react';
import { Plus, Tags as TagsIcon } from 'lucide-react';
import { tags as tagsApi, documents as docsApi } from '../api.js';
import TopHeader from '../components/TopHeader.jsx';
import Toast from '../components/Toast.jsx';
import { SkeletonTableRows } from '../components/Skeleton.jsx';

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [docs, setDocs] = useState([]);
  const [newName, setNewName] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadAll(isInitial = false) {
    try {
      const [allTags, allDocs] = await Promise.all([tagsApi.list(), docsApi.list()]);
      setTags(allTags);
      setDocs(allDocs);
    } catch (err) { setToastMessage(err.message); }
    finally { if (isInitial) setLoading(false); }
  }

  useEffect(() => { loadAll(true); }, []);

  function countFor(tagId) {
    return docs.filter((d) => (d.tags || []).some((t) => t.tagId === tagId)).length;
  }

  async function submit(e) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setSubmitting(true);
    try {
      await tagsApi.create(name);
      setNewName('');
      setToastMessage('Tag created.');
      loadAll(false);
    } catch (err) { setToastMessage(err.message); }
    finally { setSubmitting(false); }
  }

  return (
    <>
      <TopHeader title="Tags" subtitle="Fine-grained labels you can attach to any document." />

      <div className="panel-card">
        <h3 className="panel-card-title">New tag</h3>
        <form className="inline-form" onSubmit={submit}>
          <input
            className="field-input"
            type="text"
            placeholder="e.g. Urgent, Q3, Draft"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button className="btn-primary" type="submit" disabled={submitting}>
            <Plus size={16} /> Add
          </button>
        </form>
      </div>

      <div className="table-card">
        {loading ? (
          <SkeletonTableRows rows={4} cols={2} />
        ) : tags.length === 0 ? (
          <div className="empty-state">
            <TagsIcon size={28} strokeWidth={1.5} />
            <p>No tags yet — create one above.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Documents</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((t) => (
                <tr key={t.tagId}>
                  <td><div className="doc-name-cell"><TagsIcon size={16} strokeWidth={2} /><span>{t.tagName}</span></div></td>
                  <td>{countFor(t.tagId)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Toast message={toastMessage} onDone={() => setToastMessage('')} />
    </>
  );
}