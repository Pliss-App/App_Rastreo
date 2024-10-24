const jwt = require('jsonwebtoken');
require('dotenv').config(); 

// Middleware de autenticación
const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No autorizado, no cuentas con los permisos necesarios.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // Decodifica el token y agrega el usuario al request
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token no válido' });
    }
};

module.exports = { protect };
