import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config(); // carga el .env

import authRoutes from './routes/auth.routes.js'; 

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas del sistema
app.use('/api/auth', authRoutes);

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
