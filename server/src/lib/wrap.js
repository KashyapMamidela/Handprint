// Forwards rejected promises from async route handlers to Express's error
// middleware — without this, a thrown/rejected error in an async handler
// just hangs the request instead of returning a response.
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
