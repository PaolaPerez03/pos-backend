import { Router } from "express";
import { ventasPorDia, ventasPorMes, productoMasVendido } from "../controllers/venta.controller.js";
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js";
import {
    getVendedores,
    createVendedor,
    updateVendedor,
    deleteVendedor,
} from "../controllers/admin.controller.js";

const router = Router();

// RUTAS EXCLUSIVAS PARA EL ADMIN
router.get("/vendedores", verifyToken, isAdmin, getVendedores);
router.post("/vendedores", verifyToken, isAdmin, createVendedor);
router.put("/vendedores/:id", verifyToken, isAdmin, updateVendedor);
router.delete("/vendedores/:id", verifyToken, isAdmin, deleteVendedor);

// Obtener ventas por día
router.get("/ventas/dia/:fecha", verifyToken, ventasPorDia);

// Obtener ventas por mes
router.get("/ventas/mes/:anio/:mes", verifyToken, ventasPorMes);

// Producto más vendido
router.get("/producto-mas-vendido", verifyToken, productoMasVendido);
    

export default router;
