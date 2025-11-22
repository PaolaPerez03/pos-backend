// src/controllers/admin.controller.js

export const getVendedores = async (req, res) => {
    try {
        // Luego conectamos a Firestore
        res.json({
            message: "Lista de vendedores obtenida correctamente"
        });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener vendedores" });
    }
};

export const createVendedor = async (req, res) => {
    const { nombre, email } = req.body;

    if (!nombre || !email) {
        return res.status(400).json({ error: "Nombre y email son requeridos" });
    }

    try {
        // Luego lo guardamos en Firestore
        res.json({
            message: "Vendedor creado correctamente",
            data: { nombre, email }
        });
    } catch (error) {
        res.status(500).json({ error: "Error al crear vendedor" });
    }
};

export const deleteVendedor = async (req, res) => {
    const { id } = req.params;

    try {
        // Luego borramos desde Firestore
        res.json({
            message: `Vendedor con id ${id} eliminado`
        });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar vendedor" });
    }
};
