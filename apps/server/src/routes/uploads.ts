import { s3 } from "../../lib/s3";
import Elysia, { t } from "elysia";
import sharp from "sharp";

export default new Elysia({
  name: "upload",
  prefix: "/upload",
}).post(
  "/pictures",
  async ({ body, set }) => {
    const { picture } = body;

    let compressed: Buffer;

    // Decode, resize, and compress the image.
    try {
      const input = Buffer.from(await picture.arrayBuffer());

      compressed = await sharp(input, {
        limitInputPixels: 40_000_000,
      })
        .rotate()
        .resize({
          width: 1024,
          height: 1024,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({
          quality: 80,
          effort: 4,
        })
        .toBuffer();
    } catch {
      set.status = 400;

      return {
        error: "Invalid or unsupported image",
      };
    }

    // Store the processed image.
    const key = `pictures/${crypto.randomUUID()}.webp`;

    try {
      await s3.write(key, compressed, {
        type: "image/webp",
      });
    } catch (error) {
      console.error("Failed to upload image to S3:", error);

      set.status = 500;

      return {
        error: "Failed to store image",
      };
    }

    return {
      key,
      contentType: "image/webp",
      size: compressed.byteLength,
    };
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
