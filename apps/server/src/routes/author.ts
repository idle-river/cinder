import { eq } from "drizzle-orm";
import { db, user } from "../../lib/db";
import Elysia, { t } from "elysia";

export default new Elysia({ name: "author", prefix: "/author" }).get(
  "/:id",
  async ({ query }) => {
    let { userId } = query;

    const result = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    if (result && result.length > 0) {
      return {
        ok: true,
        data: result[0],
      };
    } else {
      return {
        ok: false,
        data: null,
      };
    }
  },
  {
    query: t.Object({
      userId: t.String(),
    }),
  },
);
