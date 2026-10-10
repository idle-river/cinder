import { s3 } from "../../lib/s3";
import Elysia, { t } from "elysia";
import sharp from "sharp";

export default new Elysia({
  name: "upload",
  prefix: "/upload",
}).post(
  "/pictures",
  async ({ body, set }) => {
    try {
      const { picture } = body;

      // Read the uploaded file into memory.
      const input = Buffer.from(await picture.arrayBuffer());

      // Resize and compress to WebP.
      const compressed = await sharp(input, {
        limitInputPixels: 40_000_000,
      })
        .rotate()
        .resize({
          width: 1024,
          height: 1024,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 80, effort: 4 })
        .toBuffer();

      const key = `pictures/${crypto.randomUUID()}.webp`;

      await s3.write(key, compressed, {
        type: "image/webp",
      });

      return {
        key,
        contentType: "image/webp",
        size: compressed.byteLength,
      };
    } catch {
      set.status = 400;
      return { error: "Invalid or unsupported image" };
    }
  },
  {
    body: t.Object({
      picture: t.File({
        type: "image/*",
        maxSize: "5m",
      }),
    }),
  },
);
