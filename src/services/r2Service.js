const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3, buildPublicUrl, bucket } = require('../config/r2');

const CONTENT_TYPES = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.gif': 'image/gif',
  '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

function getExt(filename) {
  const m = filename.match(/\.[0-9a-z]+$/i);
  return m ? m[0].toLowerCase() : '';
}

/**
 * Upload un buffer (issu de multer memoryStorage) vers R2.
 * @param {Buffer} buffer
 * @param {string} folder ex: 'course-thumbnails'
 * @param {string} originalName nom du fichier original (pour l'extension)
 * @returns {Promise<{key: string, url: string}>}
 */
async function uploadBuffer(buffer, folder, originalName) {
  const ext = getExt(originalName);
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const key = `${folder}/${safeName}`;

  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: CONTENT_TYPES[ext] || 'application/octet-stream',
  }));

  return { key, url: buildPublicUrl(key) };
}

async function deleteByKey(key) {
  if (!key) return;
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

module.exports = { uploadBuffer, deleteByKey };
