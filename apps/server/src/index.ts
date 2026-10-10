import cors from "@elysia/cors";
import { auth } from "../lib/auth";
import { Elysia } from "elysia";
import communities from "./routes/communities";
import posts from "./routes/posts";
import author from "./routes/author";

const app = new Elysia()
  .use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
    }),
  )
  .use(communities)
  .use(posts)
  .use(author)
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
