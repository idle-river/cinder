import { communities, db } from "../../lib/db";
import Elysia from "elysia";

export default new Elysia({ name: "communities", prefix: "/community" })
  // Basic trending communities
  .get("/", async () => {
    const result = await db.select().from(communities).limit(5);
    if (result) {
      const sorted = result.sort((a, b) => {
        if (a.stars && b.stars) {
          return a.stars - b.stars;
        } else {
          return 0;
        }
      });

      return {
        ok: true,
        data: sorted,
      };
    } else {
      return {
        ok: false,
        data: null,
      };
    }
  });
