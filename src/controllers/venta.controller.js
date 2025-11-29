import admin from "../config/firebase.js";

const db = admin.firestore();
const ventasRef = db.collection("ventas");
const detallesRef = db.collection("detalles_venta");
const cortesRef = db.collection("cortes");

// Crear folio de venta
function generarFolio() {
  const now = new Date();

  const year = String(now.getFullYear()).slice(-2); 
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const random = Math.floor(Math.random() * 90 + 10); // 2 dígitos

  return `${year}${month}${day}${hours}${minutes}${seconds}${random}`;
}

// Crear una venta
export const createVenta = async (req, res) => {
    try {
        const { total, metodo_pago, vendedor_id, vendedor_nombre, num_articulos, recibe, cambio } = req.body;

        // Validación
        if (!total || !metodo_pago || !vendedor_id || !vendedor_nombre || !num_articulos) {
            return res.status(400).json({ error: "Faltan campos obligatorios." });
        }

        // ➤ Generar folio automático
        const folio = generarFolio();

        const nuevaVenta = {
            folio,
            total,
            metodo_pago,
            vendedor_id,
            vendedor_nombre,
            num_articulos,
            recibe: recibe || 0,
            cambio: cambio || 0,
            fecha: admin.firestore.FieldValue.serverTimestamp(),
            status: "completada"
        };

        const docRef = await ventasRef.add(nuevaVenta);

        res.status(201).json({ id: docRef.id, ...nuevaVenta });

    } catch (error) {
        console.error("Error en createVenta:", error);
        res.status(500).json({ error: "Error al crear la venta" });
    }
};

// Crear un detalle de venta
export const createDetalleVenta = async (req, res) => {
    try {
        const { venta_id, producto_id, nombre_producto, categoria, cantidad, precio_unitario } = req.body;

        if (!venta_id || !producto_id || !nombre_producto || !cantidad || !precio_unitario) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        const subtotal = cantidad * precio_unitario;

        const nuevoDetalle = {
            venta_id,
            producto_id,
            nombre_producto,
            categoria: categoria || "Sin categoría",
            cantidad,
            precio_unitario,
            subtotal
        };

        const docRef = await detallesRef.add(nuevoDetalle);

        res.status(201).json({ id: docRef.id, ...nuevoDetalle });

    } catch (error) {
        console.error("Error en createDetalleVenta:", error);
        res.status(500).json({ error: "Error al crear detalle de venta" });
    }
};

// Obtener todas las ventas
export const getVentas = async (req, res) => {
    try {
        const snapshot = await ventasRef.orderBy("fecha", "desc").get();

        const ventas = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(ventas);

    } catch (error) {
        console.error("Error en getVentas:", error);
        res.status(500).json({ error: "Error al obtener ventas" });
    }
};

// Obtener detalles por venta
export const getDetallesByVenta = async (req, res) => {
    try {
        const { venta_id } = req.params;

        const snapshot = await detallesRef.where("venta_id", "==", venta_id).get();

        const detalles = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(detalles);

    } catch (error) {
        console.error("Error en getDetallesByVenta:", error);
        res.status(500).json({ error: "Error al obtener detalles de venta" });
    }
};

// Actualizar una venta
export const updateVenta = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        if (!id) {
            return res.status(400).json({ error: "Falta el ID de la venta" });
        }

        const ventaRef = ventasRef.doc(id);
        const ventaDoc = await ventaRef.get();

        if (!ventaDoc.exists) {
            return res.status(404).json({ error: "Venta no encontrada" });
        }

        await ventaRef.update({
            ...data,
            fecha_actualizacion: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ id, ...data });

    } catch (error) {
        console.error("Error en updateVenta:", error);
        res.status(500).json({ error: "Error al actualizar la venta" });
    }
};

// Descontar stock del producto
export const descontarStock = async (req, res) => {
    try {
        const { producto_id } = req.params;
        const { cantidad } = req.body;

        if (!producto_id || !cantidad) {
            return res.status(400).json({ error: "Faltan datos: producto_id o cantidad" });
        }

        const productoRef = db.collection("products").doc(producto_id);
        const productoDoc = await productoRef.get();

        if (!productoDoc.exists) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        const stockActual = productoDoc.data().stock || 0;

        if (stockActual < cantidad) {
            return res.status(400).json({ error: "Stock insuficiente" });
        }

        await productoRef.update({
            stock: admin.firestore.FieldValue.increment(-cantidad)
        });

        res.json({
            producto_id,
            stockAnterior: stockActual,
            stockNuevo: stockActual - cantidad
        });

    } catch (error) {
        console.error("Error al descontar stock:", error);
        res.status(500).json({ error: "Error al descontar stock" });
    }
};

// 📌 Obtener ARQUEO (ventas, artículos, efectivo, tarjeta, dinero en caja)
export const getArqueo = async (req, res) => {
  try {
    const { vendedor_id } = req.query; // asumimos que envías el vendedor
    if (!vendedor_id) {
      return res.status(400).json({ error: "Falta el ID del vendedor" });
    }

    // 1️⃣ Obtener el último corte del vendedor
    const ultimoCorteSnap = await cortesRef
      .where("vendedor_id", "==", vendedor_id)
      .orderBy("fecha_fin", "desc")
      .limit(1)
      .get();

    let fechaInicio = null;
    if (!ultimoCorteSnap.empty) {
      const data = ultimoCorteSnap.docs[0].data();
      fechaInicio = data.fecha_fin.toDate ? data.fecha_fin.toDate() : data.fecha_fin;
    }

    // 2️⃣ Obtener todas las ventas completadas del vendedor
    const ventasSnap = await ventasRef
      .where("status", "==", "completada")
      .where("vendedor_id", "==", vendedor_id)
      .get();

    // 3️⃣ Filtrar solo ventas posteriores al último corte
    const ventasFiltradas = ventasSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(v => !fechaInicio || (v.fecha.toDate ? v.fecha.toDate() > fechaInicio : v.fecha > fechaInicio));

    // 4️⃣ Calcular totales
    let totalVentas = 0;
    let totalArticulos = 0;
    let totalEfectivo = 0;
    let totalTarjeta = 0;

    ventasFiltradas.forEach(v => {
      totalVentas += v.total || 0;
      totalArticulos += v.num_articulos || 0;

      if (v.metodo_pago === "efectivo") totalEfectivo += v.total || 0;
      if (v.metodo_pago === "tarjeta") totalTarjeta += v.total || 0;
    });

    // 5️⃣ Devolver datos completos para el modal de previsualización
    res.json({
      total_ventas: totalVentas,
      total_articulos: totalArticulos,
      total_efectivo: totalEfectivo,
      total_tarjeta: totalTarjeta,
      num_ventas: ventasFiltradas.length,
      fecha_inicio: fechaInicio,
      fecha_fin: new Date() // fecha actual como fin del rango
    });

  } catch (error) {
    console.error("Error en getArqueo:", error);
    res.status(500).json({ error: "Error al generar el arqueo" });
  }
};
