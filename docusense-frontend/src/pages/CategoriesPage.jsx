import React, { useEffect, useState } from 'react';
import { Plus, FolderKanban } from 'lucide-react';
import { categories as categoriesApi, documents as docsApi } from '../api.js';
import TopHeader from '../components/TopHeader.jsx';
import Toast from '../components/Toast.jsx';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [docs, setDocs] = useState([]);
  const [newName, setNewName] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadAll() {
    try {
      const [cats, allDocs] = await Promise.all([categoriesApi.list(), docsApi.list()]);
      setCategories(cats);
      setDocs(allDocs);
    } catch (err) { setToastMessage(err.message); }
  }

  useEffect(() => { loadAll(); }, []);

  function countFor(catId) {
    return docs.filter((d) => d.category && d.category.catId === catId).length;
  }

  async function submit(e) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setLoading(true);
    try {
      await categoriesApi.create(name);
      setNewName('');
      setToastMessage('Category created.');
      loadAll();
    } catch (err) { setToastMessage(err.message); }
    finally { setLoading(false); }
  }

  return (
    <>
      <TopHeader title="Categories" subtitle="Organize documents into named groups." />

      <div className="panel-card">
        <h3 className="panel-card-title">New category</h3>
        <form className="inline-form" onSubmit={submit}>
          <input
            className="field-input"
            type="text"
            placeholder="e.g. Contracts, Invoices, Research"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button className="btn-primary" type="submit" disabled={loading}>
            <Plus size={16} /> Add
          </button>
        </form>
      </div>

      <div className="table-card">
        {categories.length === 0 ? (
          <div className="empty-state">
            <FolderKanban size={28} strokeWidth={1.5} />
            <p>No categories yet — create one above.</p>
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
              {categories.map((c) => (
                <tr key={c.catId}>
                  <td><div className="doc-name-cell"><FolderKanban size={16} strokeWidth={2} /><span>{c.catName}</span></div></td>
                  <td>{countFor(c.catId)}</td>
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