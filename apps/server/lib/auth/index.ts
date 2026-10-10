import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, haveIBeenPwned, username } from "better-auth/plugins";
import * as schema from "../db/schema/auth";
import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { db } from "../db";
import { ProfanityParser } from "../utils/profanity";
import entries from "../../data/profanity.json";

const rpID =
  process.env.BETTER_AUTH_URL?.replace(/^https?:\/\//, "") || "localhost";

const resolvedLogLevel =
  process.env.BETTER_AUTH_LOG_LEVEL ??
  (process.env.NODE_ENV === "production" ? "info" : "debug");
const logLevel: "error" | "debug" | "info" | "warn" =
  resolvedLogLevel === "error" ||
  resolvedLogLevel === "warn" ||
  resolvedLogLevel === "info" ||
  resolvedLogLevel === "debug"
    ? resolvedLogLevel
    : "info";

const checker = new ProfanityParser(entries);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  advanced: {
    cookiePrefix: "cinder",
  },
  emailAndPassword: {
    enabled: true,
    maxPasswordLength: 128,
    minPasswordLength: 8,
  },
  logger: {
    level: logLevel,
  },
  session: {
    expiresIn: 60 * 60 * 24, // 1 day in seconds
  },
  plugins: [
    admin({
      bannedUserMessage:
        "Your account has been banned. Please contact support for more information.",
      impersonationSessionDuration: 60 * 60, // 1 hour in seconds
    }),
    haveIBeenPwned({
      customPasswordCompromisedMessage:
        "This password has been compromised in a data breach. Please choose a different password.",
    }),
    passkey({
      rpName: "Turborepo Starter Project",
      rpID,
      authenticatorSelection: {
        residentKey: "required",
        userVerification: "required",
        authenticatorAttachment: "platform",
      },
      advanced: {
        webAuthnChallengeCookie: "cinder",
      },
    }),
    username({
      minUsernameLength: 3,
      maxUsernameLength: 20,
      usernameValidator: (username) => {
        if (username === "admin") {
          return false;
        }

        if (checker.has(username)) {
          return false;
        }

        return true;
      },
      displayUsernameValidator: (displayUsername) => {
        if (checker.has(displayUsername)) {
          return false;
        }

        // Allow only alphanumeric characters, underscores, and hyphens
        return /^[a-zA-Z0-9_-]+$/.test(displayUsername);
      },
    }),
  ],
  basePath: "/auth",
});
