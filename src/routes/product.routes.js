import { Router } from "express";
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js";

import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} from "../controllers/product.controller.js";

const router = Router();

// Rutas CRUD SOLO para admin
router.post("/", verifyToken, isAdmin, createProduct);
router.get("/", verifyToken, isAdmin, getProducts);
router.get("/:id", verifyToken, isAdmin, getProductById);
router.put("/:id", verifyToken, isAdmin, updateProduct);
router.delete("/:id", verifyToken, isAdmin, deleteProduct);

export default router;
