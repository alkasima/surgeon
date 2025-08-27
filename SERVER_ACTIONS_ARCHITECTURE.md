# Server Actions Architecture

## Overview
This document explains the proper architecture for server actions in our Next.js 13+ App Router application.

## File Structure

### Server Actions (Server-Only)
- **Location**: `src/app/actions/user-actions.ts`
- **Purpose**: Contains all server-side database operations
- **Usage**: Can only be imported by server components and API routes
- **Directive**: Single `'use server'` at the top of the file

### Client Actions (Client-Safe)
- **Location**: `src/app/user/actions.ts`
- **Purpose**: Contains client-safe wrappers that call API routes
- **Usage**: Can be imported by client components
- **No server directive needed**

## Important Rules

### ✅ DO
- Import server actions in server components and API routes
- Import client actions in client components
- Keep server actions in dedicated `actions/` folder
- Use single `'use server'` directive at top of server action files

### ❌ DON'T
- Import server actions directly in client components
- Use inline `'use server'` directives inside functions
- Mix server and client logic in the same file

## Current Implementation

### Server Actions (`src/app/actions/user-actions.ts`)
```typescript
'use server';

export async function getUserData(uid: string) {
  // Direct Firestore Admin operations
}

export async function useCredits(uid: string, featureType: FeatureType) {
  // Direct database operations
}
```

### Client Actions (`src/app/user/actions.ts`)
```typescript
export async function getUserAnalytics(uid: string) {
  // Calls API routes or uses client-side Firebase
}
```

## Migration Complete ✅

All imports have been updated to use the correct architecture:
- Server components and API routes → `@/app/actions/user-actions`
- Client components → `@/app/user/actions`

This ensures proper separation between server and client code, preventing build errors and following Next.js best practices.