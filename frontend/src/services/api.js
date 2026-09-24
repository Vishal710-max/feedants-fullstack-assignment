import { API_BASE_URL } from '../config';

let authToken = null;
export const setAuthToken = (token) => {
  authToken = token;
};

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN', details } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body, isForm = false, timeoutMs = 15000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers = { Accept: 'application/json' };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  if (body && !isForm) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError('Please check your internet connection.', { code: 'NETWORK_ERROR' });
  } finally {
    clearTimeout(timer);
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok) {
    throw new ApiError(json?.error?.message || 'Something went wrong.', {
      status: res.status,
      code: json?.error?.code || 'HTTP_ERROR',
      details: json?.error?.details,
    });
  }
  return json;
}

const enc = encodeURIComponent;

export const api = {
  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: () => request('/auth/me'),
  getCompetition: (slug) => request(`/competitions/${enc(slug)}`),
  getReviews: (slug, page = 1, limit = 10) => request(`/competitions/${enc(slug)}/reviews?page=${page}&limit=${limit}`),
  createPaymentOrder: (slug) => request(`/competitions/${enc(slug)}/payment-order`, { method: 'POST' }),
  register: (slug, payload) => request(`/competitions/${enc(slug)}/register`, { method: 'POST', body: payload }),
  uploadSubmission: (slug, file) => {
    const form = new FormData();
    form.append('file', { uri: file.uri, name: file.name, type: file.mimeType || 'application/octet-stream' });
    return request(`/competitions/${enc(slug)}/submissions`, { method: 'POST', body: form, isForm: true, timeoutMs: 10 * 60 * 1000 });
  },
};
