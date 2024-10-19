const connection = require('../config/conexion');

const getUserDpi = (_valor) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM users WHERE email = ? OR dpi = ?", [_valor, _valor], (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows[0]);
            });
    });
};


const getAllUser = (_limit, _offset) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT u.id as idUser, p.id as idPermission,  p.nombre_permiso as rol, u.name, u.last_name, u.dpi, u.email FROM users u
INNER JOIN user_permission up
ON u.id = up.iduser
INNER JOIN permission p 
ON up.permission_id = p.id LIMIT ? OFFSET ?`, [_limit, _offset], (err, rows) => {
            if (err) {
                console.error('Error getting record:', err); // Registro del error en el servidor
                return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
            }
            resolve(rows);
        });
    });
};

const getCountUser = () => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT COUNT(*) as total FROM users", (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows[0]);
            });
    });
};

const deleteId = (id) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `DELETE FROM marcas WHERE idmarca = ${id} ;`, (err, rows) => {
                if (err) {
                    console.error('Error en la consulta a la base de datos:', err); // Registro del error en el servidor
                    return reject(new Error('Error al eliminar la marca')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows[0])
            });
    });
};

const createUser = (userData) => { //getByEmail
    const { name, last_name, age, phone, email, dpi, password } = userData;

    return new Promise((resolve, reject) => {
        connection.query(
            `INSERT INTO users (name, last_name, age, phone, email, dpi, password)
               VALUES (?, ?, ?, ?, ?, ?, ?)`, [name, last_name, age, phone, email, dpi, password], (err, rows) => {
            if (err) {
                console.error('Error en la consulta a la base de datos:', err); // Registro del error en el servidor
                return reject(new Error('Error al crear la cuenta')); // Rechazo con un mensaje de error personalizado
            }
            resolve(rows)
        });
    });
};

const addPermission = (idUser) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `INSERT INTO user_permission (iduser, permission_id)
               VALUES (?, ?)`, [idUser, 2], (err, rows) => {
            if (err) {
                console.error('Error al guardar registro:', err); // Registro del error en el servidor
                return reject(new Error('Error al agregar Rol')); // Rechazo con un mensaje de error personalizado
            }
            resolve(rows)
        });
    });
};

const updateDispositivo = (id, count) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `update vistas SET visitas = ? where identity = ? `, [count, id], (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};
module.exports = {
    getAllUser,
    getCountUser,
    createUser,
    getUserDpi,
    addPermission
}