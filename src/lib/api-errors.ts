// src/lib/api-errors.ts
//
// Backend error responses aren't uniform: most routes reply with
// `{ error: { code, message } }`, but some (e.g. the catalog plan-limit
// check) have historically replied with raw ASP.NET ProblemDetails
// (`{ title, status, detail }`). Reading `data.error` directly is unsafe:
// when it's an object, passing it straight into setError() and rendering
// it as `{error}` crashes the component ("Objects are not valid as a
// React child"). parseApiError() normalizes both shapes into a plain
// string and flags the plan-limit case so callers can show a specific,
// actionable UI instead of a generic message.

export const PLAN_LIMIT_CODE = 'PLAN_LIMIT_REACHED';

export interface ParsedApiError {
  message: string;
  code: string | null;
  isPlanLimit: boolean;
}

export function parseApiError(data: unknown, fallback: string): ParsedApiError {
  const d = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  const err = d.error;

  if (typeof err === 'string' && err.trim()) {
    return { message: err, code: null, isPlanLimit: false };
  }

  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    const code = typeof e.code === 'string' ? e.code : null;
    const message = typeof e.message === 'string' && e.message.trim() ? e.message : fallback;
    return { message, code, isPlanLimit: code === PLAN_LIMIT_CODE };
  }

  // Older/ProblemDetails shape safety net: { title, status, detail }.
  if (typeof d.detail === 'string' && d.detail.trim()) {
    const isPlanLimit = d.status === 402 || /plan limit/i.test(d.detail);
    return { message: d.detail, code: isPlanLimit ? PLAN_LIMIT_CODE : null, isPlanLimit };
  }

  return { message: fallback, code: null, isPlanLimit: false };
}
