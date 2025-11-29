import admin from "../config/firebase.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


// Registro
export const registerUser = async (req, res) => {
    try {
        const { email, password, role, name } = req.body;

        if (!email || !password || !role || !name) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        const auth = admin.auth();

        // Verificar si el usuario ya existe en Auth
        try {
            await auth.getUserByEmail(email);
            return res.status(400).json({ error: "El usuario ya existe" });
        } catch (err) {
            // Si no existe, Firebase lanza error: lo ignoramos
        }

        // Crear usuario en Firebase Auth
        const newUser = await auth.createUser({
            email,
            password,
        });

        // 🔐 Generar hash para guardar en Firestore
        const hashedPassword = await bcrypt.hash(password, 10);

        // Guardar información en Firestore
        const db = admin.firestore();
        await db.collection("users").doc(newUser.uid).set({
            email,
            name,
            role,
            password: hashedPassword, // 🔥 ahora sí existe
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Crear token
        const token = jwt.sign(
            { uid: newUser.uid, email, role },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.status(201).json({
            message: "Usuario registrado correctamente",
            token,
            user: { uid: newUser.uid, email, name, role },
        });

    } catch (error) {
        console.error("Error en registerUser:", error);
        res.status(500).json({ error: "Error interno en registro" });
    }
};

// Login
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
                uid: userSnapshot.docs[0].id,
                name: userData.name,
                email: userData.email,
                role: userData.role
            }
        });

    } catch (error) {
        console.error(error); // <-- imprime el error real en consola
        res.status(500).json({ error: error.message }); // <-- envía el mensaje real al cliente
        //console.error(error);
        //res.status(500).json({ error: "Error interno en login" });
    }
};
