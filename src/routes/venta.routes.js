import { Router } from "express";
import { 
    createVenta,
    createDetalleVenta,
    getVentas,
    getDetallesByVenta,
    updateVenta,
    descontarStock,
    getArqueo
} from "../controllers/venta.controller.js";

import { crearCorte } from "../controllers/corte.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

// Crear venta
router.post("/", verifyToken, createVenta);

// Crear detalles de venta
router.post("/detalle", verifyToken, createDetalleVenta);

// Obtener todas las ventas
router.get("/", verifyToken, getVentas);

// Obtener detalles por venta
router.get("/detalles/:venta_id", verifyToken, getDetallesByVenta);

// Actualizar una venta
router.put("/:id", verifyToken, updateVenta);

// Descontar stock
router.put("/descontar-stock/:producto_id", verifyToken, descontarStock);

// 🔹 Obtener arqueo (solo previsualización, protegido)
router.get("/arqueo", verifyToken, getArqueo);

// Crear corte de caja
router.post("/corte", verifyToken, crearCorte);

export default router;
