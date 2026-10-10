import { S3Client } from "bun";

interface S3Options {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  endpoint: string;
}

export const s3 = new S3Client({
  accessKeyId: process.env.S3_ACCESS_KEY_ID!,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
  bucket: "cinder",
});
