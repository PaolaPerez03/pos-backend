import { Router } from "express";
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js";
import {
    getVendedores,
    createVendedor,
    deleteVendedor
} from "../controllers/admin.controller.js";

const router = Router();

// RUTAS EXCLUSIVAS PARA EL ADMIN
router.get("/vendedores", verifyToken, isAdmin, getVendedores);
router.post("/vendedores", verifyToken, isAdmin, createVendedor);
router.delete("/vendedores/:id", verifyToken, isAdmin, deleteVendedor);

export default router;
