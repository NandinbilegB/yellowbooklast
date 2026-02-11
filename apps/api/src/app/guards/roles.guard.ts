import type { FastifyRequest, FastifyReply } from "fastify";

export type UserRole = "USER" | "ADMIN";

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    role: UserRole;
    email?: string;
  };
}

/**
 * Guard to protect routes and require specific roles
 * Usage: app.addHook("preHandler", roleGuard(["ADMIN"]))
 */
export function roleGuard(requiredRoles: UserRole[]) {
  return async (request: AuthenticatedRequest, reply: FastifyReply) => {
    // Try to get user from JWT token or session
    const token = request.headers.authorization?.split(" ")[1];

    if (!token && !request.user) {
      return reply.status(401).send({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    const userRole = request.user?.role;

    if (!userRole || !requiredRoles.includes(userRole)) {
      return reply.status(403).send({
        error: "Forbidden",
        message: `Required role(s): ${requiredRoles.join(", ")}. Current role: ${userRole}`,
      });
    }

    // Role check passed
    return;
  };
}

/**
 * Middleware to verify JWT and attach user to request
 */
export function authMiddleware() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async (request: AuthenticatedRequest, _reply: FastifyReply) => {
    try {
      // JWT verification would happen here
      // For now, this is a placeholder
      // In production, verify the JWT token
      request.user = request.user || undefined;
    } catch (error) {
      console.error("Auth middleware error:", error);
    }
  };
}
