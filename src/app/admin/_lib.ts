export function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}
