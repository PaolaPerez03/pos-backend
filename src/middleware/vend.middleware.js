export const isVendedor = (req, res, next) => {
    if (req.user.role !== "vendedor") {
        return res.status(403).json({ error: "Solo vendedores pueden acceder" });
    }
    next();
};
