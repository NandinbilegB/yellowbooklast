# Lab 9: GitHub OAuth + NextAuth Implementation Guide

## Overview
This lab implements GitHub OAuth authentication with NextAuth.js, role-based access control (RBAC), and CSRF protection.

## 📋 Checklist

### Step 1: Create GitHub OAuth App
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name**: YellBook Dev (or any name)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy the **Client ID** and **Client Secret**
5. Update `.env.local`:
   ```
   GITHUB_ID=<your_client_id>
   GITHUB_SECRET=<your_client_secret>
   ```

### Step 2: Generate NextAuth Secret
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

Add to `.env.local`:
```
NEXTAUTH_SECRET=<generated_secret>
```

### Step 3: Database Setup
The migration `20251207025038_add_auth_models` adds these tables:
- `User` - User profile with role field
- `Account` - OAuth account links
- `Session` - Active sessions
- `VerificationToken` - Email verification

Verify migration applied:
```bash
cd apps/api
npx prisma db push
```

### Step 4: Seed Admin User
Run the seed script to create an admin user:
```bash
cd apps/api
npx ts-node prisma/seed-admin.ts
```

This creates:
- Email: `admin@yellbook.com`
- Role: `ADMIN`
- Status: Ready to login via GitHub

### Step 5: Update Layout Providers
Add SessionProvider to your root layout:

```tsx
// apps/web/src/app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

Then wrap it in layout.tsx:
```tsx
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Step 6: Install Dependencies
```bash
npm install next-auth @prisma/adapter-next-auth
```

### Step 7: Test OAuth Flow

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Visit login page**:
   - Navigate to `http://localhost:3000/login`
   - Click "Sign in with GitHub"
   - Authorize the app on GitHub

3. **Verify authentication**:
   - Should redirect to `/yellow-books` after login
   - User should be in database
   - Role defaults to `USER`

4. **Test admin page** (as admin):
   - If logged in as admin@yellbook.com, visit `http://localhost:3000/admin`
   - Should see admin dashboard
   - If logged in as regular user, should be redirected

## 🔐 Security Features

### 1. Role-Based Access Control (RBAC)
- **User Model**: Added `role: UserRole` field (USER | ADMIN)
- **Admin Guard**: `requireAdminSession()` for server-side protection
- **API Guard**: `roleGuard()` for Fastify routes

### 2. Protected Routes

**Admin Routes** (require ADMIN role):
```
/admin - Dashboard
/admin/users - User management
/admin/businesses - Business moderation
/admin/settings - System settings
```

**Protected Routes** (require authentication):
```
/yellow-books - Yellow pages listing
/yellow-books/assistant - AI search assistant
```

### 3. CSRF Protection
- Tokens generated for form submissions
- Validated via `x-csrf-token` header
- HttpOnly cookies prevent JavaScript access
- SameSite=Strict prevents cross-site attacks

### 4. Session Management
- JWT-based sessions (30-day max)
- Auto-refresh on 24-hour interval
- Secure cookie storage
- Automatic cleanup of expired sessions

## 📁 Files Created

```
apps/web/
├── .env.local (updated)
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx (updated)
│   │   └── api/
│   │       └── auth/
│   │           └── [...nextauth]/
│   │               └── route.ts
│   └── lib/
│       ├── auth.ts
│       ├── server-auth.ts
│       └── csrf.ts

apps/api/
├── prisma/
│   ├── schema.prisma (updated)
│   ├── migrations/
│   │   └── 20251207025038_add_auth_models/
│   │       └── migration.sql
│   └── seed-admin.ts
├── src/app/
│   └── guards/
│       └── roles.guard.ts
```

## 🚀 Usage Examples

### Client-Side: Sign In/Out
```tsx
import { signIn, signOut, useSession } from "next-auth/react";

export function UserMenu() {
  const { data: session } = useSession();

  if (!session?.user) {
    return <button onClick={() => signIn("github")}>Sign In</button>;
  }

  return (
    <>
      <span>{session.user.name}</span>
      <button onClick={() => signOut()}>Sign Out</button>
    </>
  );
}
```

### Server-Side: Check Admin Role
```tsx
import { requireAdminSession } from "@/lib/server-auth";

export default async function AdminPage() {
  const session = await requireAdminSession();
  // Automatically redirects if not admin
  return <div>Admin Dashboard</div>;
}
```

### API: Role Guard
```tsx
import { roleGuard } from "@yellbook/api/guards/roles.guard";

app.addHook("preHandler", roleGuard(["ADMIN"]));
app.delete("/api/admin/users/:id", async (request, reply) => {
  // Only ADMIN can call this
});
```

## 🧪 Testing

### Test Admin Panel
1. Login as `admin@yellbook.com` (if seeded)
2. Visit `/admin`
3. Should see dashboard with statistics
4. Verify sign-out button works

### Test Regular User
1. Create new GitHub OAuth account
2. Login with different account
3. Visit `/admin` - should redirect
4. Can access `/yellow-books`

### Test CSRF Protection
1. Submit form with missing CSRF token
2. Should receive 403 error
3. With correct token - should succeed

## 🔧 Troubleshooting

### "Invalid Client ID"
- Check GitHub app credentials in `.env.local`
- Verify Client ID matches GitHub settings

### "Session not found"
- Ensure `NEXTAUTH_SECRET` is set
- Check database connection
- Clear browser cookies and retry

### "Redirect URL mismatch"
- GitHub app redirect URL must match exactly
- For local dev: `http://localhost:3000/api/auth/callback/github`
- For production: Update to your domain

### Admin not redirecting correctly
- Verify user role in database: `SELECT * FROM "User"`
- Check user.role = 'ADMIN'
- Clear session cookies and login again

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org)
- [GitHub OAuth Docs](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [NextAuth + Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
- [OWASP CSRF Prevention](https://owasp.org/www-community/attacks/csrf)

## ✅ Checklist for Submission

- [ ] GitHub OAuth app created
- [ ] `.env.local` configured with credentials
- [ ] Database migration applied
- [ ] Admin user seeded
- [ ] `SessionProvider` added to layout
- [ ] Login page displays GitHub button
- [ ] OAuth flow works end-to-end
- [ ] Admin panel accessible as admin
- [ ] Regular users redirected from /admin
- [ ] Sign out clears session
- [ ] CSRF tokens validated
- [ ] All tests passing

## 💡 Next Steps

1. **Custom Callback**: Implement onSuccess/onError handlers
2. **Email Verification**: Add email verification flow
3. **2FA**: Implement two-factor authentication
4. **Audit Logging**: Log admin actions
5. **Rate Limiting**: Limit login attempts
6. **Social Link Account**: Allow users to link multiple OAuth providers
