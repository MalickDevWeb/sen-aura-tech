/**
 * authFetch.ts
 * Wrapper autour de fetch() qui injecte automatiquement le token JWT 
 * dans le header Authorization s'il existe dans le localStorage.
 */
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("senaura_auth_token") || "";
  }

  const defaultHeaders: Record<string, string> = {};
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const customHeaders = init?.headers ? new Headers(init.headers) : new Headers();
  
  // Merge default auth headers with any provided headers
  for (const [key, value] of Object.entries(defaultHeaders)) {
    if (!customHeaders.has(key)) {
      customHeaders.set(key, value);
    }
  }

  const finalInit = {
    ...init,
    headers: customHeaders,
  };

  return fetch(input, finalInit);
}
