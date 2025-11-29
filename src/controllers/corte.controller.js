import admin from "../config/firebase.js";

const db = admin.firestore();
const ventasRef = db.collection("ventas");
const cortesRef = db.collection("cortes");

// Crear un corte de caja
export const crearCorte = async (req, res) => {
  try {
    const { vendedor_id, vendedor_nombre } = req.body;
    if (!vendedor_id || !vendedor_nombre) {
      return res.status(400).json({ error: "Faltan datos del vendedor" });
    }

    // 1. Obtener el último corte registrado
    const ultimoCorteSnap = await cortesRef
      .where("vendedor_id", "==", vendedor_id)
      .orderBy("fecha_fin", "desc")
      .limit(1)
      .get();

    let fechaInicio = null;
    if (!ultimoCorteSnap.empty) {
      fechaInicio = ultimoCorteSnap.docs[0].data().fecha_fin.toDate
        ? ultimoCorteSnap.docs[0].data().fecha_fin.toDate()
        : ultimoCorteSnap.docs[0].data().fecha_fin;
    }

    // 2. Consultar todas las ventas del vendedor (sin filtros compuestos)
    const ventasSnap = await ventasRef
      .where("vendedor_id", "==", vendedor_id)
      .get();

    // 3. Filtrar en JS solo las ventas posteriores al último corte
    const ventasFiltradas = ventasSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(v => !fechaInicio || v.fecha.toDate
        ? v.fecha.toDate() > fechaInicio
        : v.fecha > fechaInicio
      );

    if (ventasFiltradas.length === 0) {
      return res.status(400).json({ error: "No hay ventas para cortar" });
    }

    // 4. Calcular totales
    let totalVentas = 0;
    let totalArticulos = 0;
    let totalEfectivo = 0;
    let totalTarjeta = 0;

    ventasFiltradas.forEach(v => {
      totalVentas += v.total || 0;
      totalArticulos += v.num_articulos || 0;
      if (v.metodo_pago === "efectivo") totalEfectivo += v.total;
      else if (v.metodo_pago === "tarjeta") totalTarjeta += v.total;
    });

    const fechaFin = new Date();

    // 5. Guardar el corte
    const nuevoCorte = {
      vendedor_id,
      vendedor_nombre,
      fecha_inicio: fechaInicio || "INICIO DEL SISTEMA",
      fecha_fin: fechaFin,
      total_ventas: totalVentas,
      total_articulos: totalArticulos,
      total_efectivo: totalEfectivo,
      total_tarjeta: totalTarjeta,
      num_ventas: ventasFiltradas.length
    };

    const docRef = await cortesRef.add(nuevoCorte);

    res.status(201).json({ corte_id: docRef.id, ...nuevoCorte });

  } catch (error) {
    console.error("Error creando corte:", error);
    res.status(500).json({ error: "Error al generar el corte de caja" });
  }
};