// apex-kicks/src/lib/api.js
// Central API client. Every backend call goes through here.

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

async function request(method, path, { body, token } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE}/api${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        // data.error can be a plain string OR a Zod flatten object like:
        // { formErrors: [], fieldErrors: { items: ['...'], shipping: ['...'] } }
        // Extract a readable string in either case.
        let msg = 'Request failed';
        if (typeof data.error === 'string') {
            msg = data.error;
        } else if (data.error && typeof data.error === 'object') {
            const { fieldErrors = {}, formErrors = [] } = data.error;
            const parts = [
                ...formErrors,
                ...Object.entries(fieldErrors).map(([k, v]) =>
                    `${k}: ${Array.isArray(v) ? v.join(', ') : v}`
                ),
            ];
            msg = parts.length ? parts.join(' · ') : JSON.stringify(data.error);
        } else if (data.message) {
            msg = data.message;
        }
        throw Object.assign(new Error(msg), { status: res.status, data });
    }

    return data;
}

const api = {
    get: (path, token) => request('GET', path, { token }),
    post: (path, body, token) => request('POST', path, { body, token }),
    patch: (path, body, token) => request('PATCH', path, { body, token }),
    delete: (path, token) => request('DELETE', path, { token }),
};

export default api;