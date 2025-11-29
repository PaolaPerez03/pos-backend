import admin from "../config/firebase.js";

const db = admin.firestore();
const productsRef = db.collection("products");

// 📌 Obtener todos los productos
export const getProductosVendedor = async (req, res) => {
    try {
        const snapshot = await productsRef.get();
        const productos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(productos);

    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: "Error al obtener productos" });
    }
};

export const updateStockProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;

        if (stock === undefined) {
            return res.status(400).json({ error: "El stock es obligatorio" });
        }

        await productsRef.doc(id).update({
            stock,
            updatedAt: new Date()
        });

        res.json({ message: "Stock actualizado correctamente", id, stock });

    } catch (error) {
        console.error("Error al actualizar stock:", error);
        res.status(500).json({ error: "Error al actualizar stock" });
    }
};
