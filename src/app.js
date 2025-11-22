import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config(); // carga el .env

import authRoutes from './routes/auth.routes.js'; 
import adminRoutes from "./routes/admin.routes.js";
import productRoutes from "./routes/product.routes.js";

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas del sistema
app.use('/api/auth', authRoutes);

// Rutas solo para admin
app.use("/api/admin", adminRoutes);

// Rutas para obtener productos
app.use("/api/products", productRoutes);

// Ruta inicial para probar el servidor
app.get('/', (req, res) => {
  res.json({ message: 'POS backend funcionando con Firebase + JWT' });
});

// Manejo de error general
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Levantar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
