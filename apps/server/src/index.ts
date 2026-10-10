import cors from "@elysia/cors";
import { auth } from "../lib/auth";
import { Elysia } from "elysia";
import communities from "./routes/communities";

const app = new Elysia()
  .use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
    }),
  )
  .use(communities)
  .mount("/auth", auth.handler)
  .listen(3000);

export type App = typeof app;

export const GET = app.get;
export const POST = app.post;
export const PUT = app.put;
export const DELETE = app.delete;

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
