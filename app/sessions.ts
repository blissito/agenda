// app/sessions.ts
import { createCookieSessionStorage } from "react-router"; // or cloudflare/deno

type CustomerEventAccess = {
  eventId: string;
  customerId: string;
  action: "confirm" | "modify" | "cancel";
  expiresAt: number;
};

type SessionData = {
  userId: string;
  customerEventAccess?: CustomerEventAccess;
};

type SessionFlashData = {
  error: string;
};

const isProduction = process.env.NODE_ENV === "production";

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__session",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
      secrets: [process.env.SESSION_SECRET || "dev-secret-change-me"],
      secure: isProduction,
    },
  });

export { getSession, commitSession, destroySession };
