import admin from "../config/firebase.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email y contraseña son requeridos" });
        }

        // Buscar usuario en Firestore
        const userSnapshot = await admin.firestore()
            .collection("users")
            .where("email", "==", email)
            .get();

        if (userSnapshot.empty) {
            return res.status(404).json({ error: "El usuario no existe" });
        }

        const userData = userSnapshot.docs[0].data();

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, userData.password);

        if (!validPassword) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        // Generar JWT
        const token = jwt.sign(
            {
                uid: userSnapshot.docs[0].id,
                role: userData.role,
                email: userData.email,
            },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
        );

        res.json({
            message: "Login exitoso",
            token,
            user: {
                email: userData.email,
                role: userData.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno en login" });
    }
};
