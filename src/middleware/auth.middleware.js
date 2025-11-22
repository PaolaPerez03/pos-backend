import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    let token = req.headers["authorization"];

    if (!token) {
        return res.status(403).json({ error: "Token requerido" });
    }

    // Acepta "Bearer token" o solo "token"
    token = token.startsWith("Bearer ") ? token.split(" ")[1] : token;

    if (!token || token === "undefined") {
        return res.status(403).json({ error: "Token inválido o ausente" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // uid, email, role
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
};

export const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "No autenticado" });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Acceso denegado, solo admin" });
    }

    next();
};

