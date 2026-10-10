
#!/bin/sh
set -eu

ENDPOINT="http://rustfs:9000"

export AWS_ACCESS_KEY_ID="${S3_ACCESS_KEY_ID:?S3_ACCESS_KEY_ID is required}"
export AWS_SECRET_ACCESS_KEY="${S3_SECRET_ACCESS_KEY:?S3_SECRET_ACCESS_KEY is required}"
export AWS_DEFAULT_REGION="us-east-1"
export AWS_EC2_METADATA_DISABLED="true"

aws_s3() {
  aws --endpoint-url "$ENDPOINT" "$@"
}

echo "Waiting for RustFS..."
until aws_s3 s3api list-buckets >/dev/null 2>&1; do
  sleep 2
done

BUCKET="cinder"

echo "Ensuring bucket '$BUCKET' exists..."
if ! aws_s3 s3api head-bucket --bucket "$BUCKET" >/dev/null 2>&1; then
  aws_s3 s3api create-bucket --bucket "$BUCKET"
fi

echo "Applying public-read policy..."
aws_s3 s3api put-bucket-policy \
  --bucket "$BUCKET" \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "PublicReadPfps",
        "Effect": "Allow",
        "Principal": "*",
        "Action": ["s3:GetObject"],
        "Resource": ["arn:aws:s3:::cinder/pfps/*"]
      },
      {
        "Sid": "PublicReadMedia",
        "Effect": "Allow",
        "Principal": "*",
        "Action": ["s3:GetObject"],
        "Resource": ["arn:aws:s3:::cinder/media/*"]
      }
    ]
  }'

echo "RustFS initialization complete."
