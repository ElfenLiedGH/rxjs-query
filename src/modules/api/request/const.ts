export const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

export const METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE'
} as const;

export const inProgressState = {
    loading: true,
    called: true,
    completed: false
}

export const completedProgressState = {
    loading: false,
    called: true,
    completed: true
}