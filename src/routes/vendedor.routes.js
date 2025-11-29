import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { isVendedor } from "../middleware/vend.middleware.js";

import {
    getProductosVendedor,
    updateStockProducto
} from "../controllers/vendedor.controller.js";

const router = Router();

// 📌 Obtener lista de productos (solo vendedores)
router.get("/productos", verifyToken, isVendedor, getProductosVendedor);

// 📌 Actualizar solo stock
router.put("/productos/:id/stock", verifyToken, isVendedor, updateStockProducto);

export default router;
