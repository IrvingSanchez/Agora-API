import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccount = JSON.parse(
    readFileSync(join(__dirname, '../../firebase-credentials.json'), 'utf-8')
);

// Initialize Firebase Admin
initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
    databaseURL: "https://sorteonav-default-rtdb.firebaseio.com"
});

const db = getDatabase();

export { db };