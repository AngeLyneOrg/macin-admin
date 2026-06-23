const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

function buildPublicUrl(key) {
  const base = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
  return `${base}/${key}`;
}

module.exports = { s3, buildPublicUrl, bucket: process.env.R2_BUCKET_NAME };
