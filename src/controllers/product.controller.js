import admin from "../config/firebase.js";
const db = admin.firestore();

// Referencia a la colección de productos
const productsRef = admin.firestore().collection("products");

// Crear producto
export const createProduct = async (req, res) => {
    try {
        const { codigo, nombre, stock, descripcion, categoria } = req.body;

        if (!codigo || !nombre || stock === undefined || !categoria) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        const db = admin.firestore();
        const productsRef = db.collection("products");

        // Verificar si ya existe un producto con ese código
        const existing = await productsRef.where("codigo", "==", codigo).get();

        if (!existing.empty) {
            return res.status(400).json({ error: "El código ya está registrado" });
        }

        const nuevoProducto = {
            codigo,
            nombre,
            stock,
            descripcion: descripcion || "",
            categoria,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await productsRef.add(nuevoProducto);

        res.status(201).json({
            message: "Producto creado correctamente",
            producto: nuevoProducto,
        });

    } catch (error) {
        console.error("Error en createProduct:", error);
        res.status(500).json({ error: "Error interno en el servidor" });
    }
};

// Obtener todos los productos
export const getProducts = async (req, res) => {
    try {
        const snapshot = await productsRef.get();

        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(products);
    } catch (error) {
        console.error("Error en getProducts:", error);
        res.status(500).json({ error: "Error interno al obtener productos" });
    }
};

// Obtener 1 producto por ID
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const doc = await productsRef.doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error en getProductById:", error);
        res.status(500).json({ error: "Error interno al obtener producto" });
    }
};

// Actualizar producto
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { codigo, nombre, stock, descripcion } = req.body;

        const docRef = productsRef.doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        await docRef.update({
            codigo,
            nombre,
            stock,
            descripcion,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.json({ message: "Producto actualizado" });
    } catch (error) {
        console.error("Error en updateProduct:", error);
        res.status(500).json({ error: "Error interno al actualizar producto" });
    }
};

// Eliminar producto
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const docRef = productsRef.doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        await docRef.delete();
        res.json({ message: "Producto eliminado" });
    } catch (error) {
        console.error("Error en deleteProduct:", error);
        res.status(500).json({ error: "Error interno al eliminar producto" });
    }
};
