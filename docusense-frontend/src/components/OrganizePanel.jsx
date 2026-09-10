import React, { useState } from 'react';

export default function OrganizePanel({
  categories, tags, activeFilter, onFilterCategory, onFilterTag, onClearFilter,
  onCreateCategory, onCreateTag,
}) {
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');

  function submitCategory() {
    const name = newCategory.trim();
    if (!name) return;
    onCreateCategory(name);
    setNewCategory('');
  }

  function submitTag() {
    const name = newTag.trim();
    if (!name) return;
    onCreateTag(name);
    setNewTag('');
  }

  return (
    <div className="organize">
      <div className="chip-group">
        <p className="chip-group-title">Categories</p>
        <div className="chip-row">
          <span
            className={`chip ${activeFilter.type === null ? 'active' : ''}`}
            onClick={onClearFilter}
          >
            All
          </span>
          {categories.map((c) => (
            <span
              key={c.catId}
              className={`chip ${activeFilter.type === 'category' && activeFilter.id === c.catId ? 'active' : ''}`}
              onClick={() => onFilterCategory(c.catId, c.catName)}
            >
              {c.catName}
            </span>
          ))}
        </div>
        <div className="chip-add">
          <input
            type="text"
            placeholder="New category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submitCategory(); }}
          />
          <button onClick={submitCategory}>Add</button>
        </div>
      </div>

      <div className="chip-group">
        <p className="chip-group-title">Tags</p>
        <div className="chip-row">
          {tags.length === 0 && <span className="doc-meta">No tags yet.</span>}
          {tags.map((t) => (
            <span
              key={t.tagId}
              className={`chip tag-chip ${activeFilter.type === 'tag' && activeFilter.id === t.tagId ? 'active' : ''}`}
              onClick={() => onFilterTag(t.tagId, t.tagName)}
            >
              {t.tagName}
            </span>
          ))}
        </div>
        <div className="chip-add">
          <input
            type="text"
            placeholder="New tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submitTag(); }}
          />
          <button onClick={submitTag}>Add</button>
        </div>
      </div>
    </div>
  );
}