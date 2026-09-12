const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function getToken() {
  return localStorage.getItem('docusense_token');
}

export class SessionExpiredError extends Error {}

async function request(path, options = {}) {
  const headers = Object.assign({}, options.headers, {
    Authorization: `Bearer ${getToken()}`,
  });
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    throw new SessionExpiredError('Session expired.');
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = data.message || message;
    } catch (_) { /* no JSON body */ }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const auth = {
  register: (username, password, email) =>
    fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed.');
      return data;
    }),
  login: (username, password, rememberMe = false) =>
    fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, rememberMe }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed.');
      return data;
    }),
  forgotPassword: (email) =>
    fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong.');
      return data;
    }),
  resetPassword: (token, newPassword) =>
    fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not reset password.');
      return data;
    }),
};

export const documents = {
  list: (filter, page = 0, size = 10) => {
    let path = `/api/documents?page=${page}&size=${size}`;
    if (filter?.type === 'category') path = `/api/documents?categoryId=${filter.id}&page=${page}&size=${size}`;
    else if (filter?.type === 'tag') path = `/api/documents?tagId=${filter.id}&page=${page}&size=${size}`;
    else if (filter?.type === 'search') path = `/api/documents?search=${encodeURIComponent(filter.id)}&page=${page}&size=${size}`;
    return request(path);
  },
  // Fetches every page and concatenates results — for pages that need the
  // full document set (counts, charts) rather than one page at a time.
  listAll: async (filter) => {
    const pageSize = 100;
    let page = 0;
    let all = [];
    while (true) {
      const result = await documents.list(filter, page, pageSize);
      all = all.concat(result.content);
      if (result.last) break;
      page += 1;
    }
    return all;
  },
  upload: (file, categoryId) => {
    const formData = new FormData();
    formData.append('file', file);
    if (categoryId) formData.append('categoryId', categoryId);
    return request('/api/documents/upload', { method: 'POST', body: formData });
  },
  uploadBatch: (files, categoryId) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    if (categoryId) formData.append('CategoryId', categoryId);
    return request('/api/documents/batch', { method: 'POST', body: formData });
  },
  analyze: (id) => request(`/api/documents/${id}/analyze`, { method: 'POST' }),
  remove: (id) => request(`/api/documents/${id}`, { method: 'DELETE' }),
  addTags: (id, tagIds) =>
    request(`/api/documents/${id}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tagIds),
    }),
};

export const categories = {
  list: () => request('/api/categories'),
  create: (name) =>
    request('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }),
};

export const tags = {
  list: () => request('/api/tags'),
  create: (name) =>
    request('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }),
};