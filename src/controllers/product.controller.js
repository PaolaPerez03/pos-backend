import admin from "../config/firebase.js";
const db = admin.firestore();

// Referencia a la colección de productos
const productsRef = db.collection("products");

// Crear producto
export const createProduct = async (req, res) => {
    try {
        const { codigo, nombre, descripcion, stock, categoria, precio } = req.body;

        if (!codigo || !nombre || !stock || !precio) {
            return res.status(400).json({ error: "codigo, nombre, stock y precio son requeridos" });
        }

        const newProduct = {
            codigo,
            nombre,
            descripcion: descripcion || "",
            stock,
            categoria: categoria || "",
            precio,
            creado_en: new Date()
        };

        const docRef = await productsRef.add(newProduct);

        return res.json({ id: docRef.id, ...newProduct });
    } catch (error) {
        console.error("Error en createProduct:", error);
        return res.status(500).json({ error: "Error al crear producto" });
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
        const id = req.params.id;
        const { codigo, nombre, descripcion, stock, categoria, precio } = req.body;

        const updatedData = {
            ...(codigo && { codigo }),
            ...(nombre && { nombre }),
            ...(descripcion && { descripcion }),
            ...(stock && { stock }),
            ...(categoria && { categoria }),
            ...(precio && { precio }),
            actualizado_en: new Date()
        };

        await productsRef.doc(id).update(updatedData);

        return res.json({ id, ...updatedData });
    } catch (error) {
        console.error("Error en updateProduct:", error);
        return res.status(500).json({ error: "Error al actualizar producto" });
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
