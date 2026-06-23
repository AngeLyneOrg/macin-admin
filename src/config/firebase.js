const admin = require('firebase-admin');
const path = require('path');

let initialized = false;

function initFirebase() {
  if (initialized) return admin;

  const keyPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json');
  const serviceAccount = require(keyPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  initialized = true;
  return admin;
}

const firebaseAdmin = initFirebase();
const db = firebaseAdmin.firestore();

module.exports = { admin: firebaseAdmin, db };
