const connection = require('../config/conexion');

const getMenuDrawer = (_valor) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM menu_drawer;", (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows);
            });
    });
};

module.exports = {
    getMenuDrawer 
}