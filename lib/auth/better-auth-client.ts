"use client";

import { createAuthClient } from "better-auth/react";

// Requests stay on the frontend origin; Next.js forwards them to NestJS.
export const authClient = createAuthClient({ basePath: "/api/auth" });
