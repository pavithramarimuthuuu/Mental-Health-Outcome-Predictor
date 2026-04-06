const configuredBase = import.meta.env.VITE_API_BASE_URL?.trim();

const API_BASE_CANDIDATES = configuredBase
  ? [configuredBase]
  : import.meta.env.PROD 
    ? [''] // Empty string so we use relative paths like /api/... in production
    : [
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      'http://localhost:5001',
      'http://127.0.0.1:5001',
      'http://localhost:5002',
      'http://127.0.0.1:5002',
    ];

async function tryFetch(url, options) {
  return fetch(url, options);
}

export async function apiRequest(path, options = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  let lastError;

  for (const base of API_BASE_CANDIDATES) {
    try {
      const response = await tryFetch(`${base}${normalizedPath}`, options);
      return response;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Unable to reach API server.');
}

