// Shared across every admin page. Centralizing the base URL and the
// Authorization header logic here means each page's own script just calls
// adminApi.get(...) / adminApi.post(...) without repeating this setup.

const API_BASE = 'https://water-skill-app-api.onrender.com/api';

const adminApi = {
  get: (path) => authedRequest('GET', path),
  post: (path, data) => authedRequest('POST', path, data),
  put: (path, data) => authedRequest('PUT', path, data),
};

function authedRequest(method, path, data) {
  const token = localStorage.getItem('admin_token');
  return $.ajax({
    url: API_BASE + path,
    method: method,
    data: data ? JSON.stringify(data) : undefined,
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/json',
    },
  }).fail(function (xhr) {
    // 401 = bad/expired token, 403 = logged in but not an admin.
    // Either way, they don't belong on this panel — send them back to login.
    if (xhr.status === 401 || xhr.status === 403) {
      localStorage.removeItem('admin_token');
      window.location.href = 'login.html';
    }
  });
}

// Call this at the top of every protected admin page (dashboard.html etc).
// It doesn't just check "is there a token" — it actually asks the backend
// to confirm this token belongs to an admin, since a regular user's valid
// token would pass a simpler "token exists" check but should still be
// rejected here.
function requireAdmin() {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  $.ajax({
    url: API_BASE + '/admin/stats',
    method: 'GET',
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' },
  }).fail(function () {
    localStorage.removeItem('admin_token');
    window.location.href = 'login.html';
  });
}

function adminLogout() {
  authedRequest('POST', '/logout').always(function () {
    localStorage.removeItem('admin_token');
    window.location.href = 'login.html';
  });
}
