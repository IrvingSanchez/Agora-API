import admin from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS as string;
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

export const db = getFirestore(admin.app(), 'development');
db.settings({ ignoreUndefinedProperties: true }); 