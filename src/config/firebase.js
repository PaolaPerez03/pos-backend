import admin from "firebase-admin";
import dotenv from "dotenv";
import path from "path";

// Cargar el .env desde el root del proyecto
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const { PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

if (!PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error("Faltan variables de conexion a Firebase");
}

const serviceAccount = {
    type: "service_account",
    project_id: PROJECT_ID,
    private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: FIREBASE_CLIENT_EMAIL,
};

if (!admin.apps.length) {
    admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    });
}

export default admin;
