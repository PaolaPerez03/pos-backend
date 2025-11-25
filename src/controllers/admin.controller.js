// src/controllers/admin.controller.js
import admin from "../config/firebase.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const db = admin.firestore();

const usersRef = db.collection("users");

export const getVendedores = async (req, res) => {
    try {
        const snapshot = await usersRef.get();

        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(users);
    } catch (error) {
        console.error("Error en getUsers:", error);
        res.status(500).json({ error: "Error interno al obtener usuarios" });
    }
};

export const createVendedor = async (req, res) => { 
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

export const updateVendedor = async (req, res) => {
    try {
        const id = req.params.id;
        const { email, name, password, role } = req.body;

        // 1. Obtener usuario anterior
        const userDoc = await usersRef.doc(id).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "Vendedor no encontrado" });
        }

        const oldData = userDoc.data();

        // 2. Si enviaron nueva contraseña → encriptar
        let hashedPassword;
        let passwordToShow = oldData.password; // valor desencriptado NO existe, pero mostramos campo recibido

        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
            passwordToShow = password; // mostrar la contraseña nueva sin encriptar en la respuesta
        }

        // 3. Construir objeto para actualizar Firestore
        const updatedData = {
            ...(email && { email }),
            ...(name && { name }),
            ...(password && { password: hashedPassword }), // 🔐 siempre guardamos encriptada
            ...(role && { role }),
            actualizado_en: new Date()
        };

        // 4. Guardar en Firestore
        await usersRef.doc(id).update(updatedData);

        // 5. Respuesta final
        return res.json({
            id,
            email: updatedData.email || oldData.email,
            name: updatedData.name || oldData.name,
            role: updatedData.role || oldData.role,
            password_mostrada: passwordToShow,   // 👈 aquí va la contraseña visible
            password_guardada: updatedData.password, // 👈 encriptada
            actualizado_en: updatedData.actualizado_en
        });

    } catch (error) {
        console.error("Error en updateUser:", error);
        return res.status(500).json({ error: "Error al actualizar usuario" });
    }
};

export const deleteVendedor = async (req, res) => {
    const { id } = req.params;

    try {
        const userRef = db.collection("users").doc(id);
        const docSnap = await userRef.get();

        // Validar que el vendedor exista
        if (!docSnap.exists) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Eliminar
        await userRef.delete();

        res.json({ 
            message: `Usuario con id ${id} eliminado correctamente`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar usuario" });
    }
};
