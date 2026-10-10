import { db, posts } from "../../lib/db";
import Elysia from "elysia";

export default new Elysia({ name: "posts", prefix: "/post" })
  // Basic feed for a anon user
  // Will add a authed /feed endpoint
  .get("/", async () => {
    const result = await db.select().from(posts).limit(10);
    if (result) {
      return {
        ok: true,
        data: result,
      };
    } else {
      return {
        ok: false,
        data: null,
      };
    }
  });
