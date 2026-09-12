// Explicitly offers the browser's native password manager a credential to
// save. Needed because this app submits via fetch() rather than a real HTML
// form POST, so browsers' automatic "save password?" heuristics often never
// trigger. Safari doesn't support PasswordCredential — this silently does
// nothing there, which is fine; it's a progressive enhancement, not required
// for login/register to work.
export async function offerToSaveCredential(username, password) {
  if (!('credentials' in navigator) || typeof window.PasswordCredential === 'undefined') {
    return;
  }
  try {
    const credential = new window.PasswordCredential({
      id: username,
      password,
      name: username,
    });
    await navigator.credentials.store(credential);
  } catch (_) {
    // Non-critical — if the browser refuses or the API misbehaves, just skip it.
  }
}