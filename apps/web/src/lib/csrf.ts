import crypto from "crypto";
import type { NextRequest } from "next/server";

/**
 * CSRF Token Management
 * - Generate tokens for forms
 * - Validate tokens from requests
 * - Store tokens in cookies and verify against headers
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_HEADER = "x-csrf-token";
const CSRF_COOKIE = "csrf-token";

/**
 * Generate a new CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

/**
 * Validate CSRF token from request
 * Checks both header and cookie
 */
export function validateCsrfToken(
  request: NextRequest,
  token: string
): boolean {
  // Get CSRF token from cookie
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;

  if (!cookieToken) {
    return false;
  }

  // Compare tokens using constant-time comparison
  const headerToken = request.headers.get(CSRF_HEADER) || token;

  return (
    crypto.timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(headerToken)
    ) === true
  );
}

/**
 * Get CSRF token for rendering in forms
 * Should be called server-side during form rendering
 */
export function getCsrfTokenForForm(): string {
  // This should be implemented with actual cookie retrieval
  // In production, retrieve from request context
  return "";
}

/**
 * Response helper to set CSRF cookie
 */
export function setCsrfCookie(
  response: Response,
  token: string
): Response {
  // Set as HttpOnly, Secure, SameSite
  const headers = new Headers(response.headers);
  headers.set(
    "Set-Cookie",
    `${CSRF_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60 * 24}`
  );
  return new Response(response.body, {
    ...response,
    headers,
  });
}
