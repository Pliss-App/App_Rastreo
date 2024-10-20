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

const getUserLogin = (_valor) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT u.id as idUser, p.id as idPermission,  p.nombre_permiso as rol, u.name, u.last_name, u.password, u.dpi, u.email, u.phone, u.age, u.created_at FROM users u INNER JOIN user_permission up ON u.id = up.iduser INNER JOIN permission p  ON up.permission_id = p.id WHERE email = ? OR dpi = ?", [_valor, _valor], (err, rows) => {
            if (err) {
                console.error('Error getting record:', err); // Registro del error en el servidor
                return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
            }
            resolve(rows[0]);
        });
    });
};

const getUserById = (_id) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT u.id as idUser, p.id as idPermission,  p.nombre_permiso as rol, u.name, u.last_name, u.password, u.dpi, u.email, u.phone, u.age, u.created_at FROM users u INNER JOIN user_permission up ON u.id = up.iduser INNER JOIN permission p  ON up.permission_id = p.id WHERE u.id=?", [_id], (err, rows) => {
            if (err) {
                console.error('Error getting record:', err); // Registro del error en el servidor
                return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
            }
            resolve(rows[0]);
        });
    });
};

const getPermission = () => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT id , nombre_permiso as rol FROM permission WHERE 1", (err, rows) => {
            if (err) {
                console.error('Error getting record:', err); // Registro del error en el servidor
                return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
            }
            resolve(rows);
        });
    });
};

const getUserByDpi = (_valor) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM users WHERE dpi = ?", [_valor], (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows[0]);
            });
    });
};

const getUserByemail = (_valor) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM users WHERE email = ?", [_valor], (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows[0]);
            });
    });
};



const getAllUser = (_limit, _offset, _rol) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT u.id as idUser, p.id as idPermission,  p.nombre_permiso as rol, u.name, u.last_name, u.dpi, u.email FROM users u
                INNER JOIN user_permission up
                ON u.id = up.iduser
                INNER JOIN permission p 
                ON up.permission_id = p.id WHERE p.nombre_permiso=?  LIMIT ? OFFSET ?`, [_rol, _limit, _offset], (err, rows) => {
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

const createUser = (userData) => { //getByEmail
    const {userId, name, last_name, age, phone, email, dpi, password } = userData;

    return new Promise((resolve, reject) => {
        connection.query(
            `INSERT INTO users (id, name, last_name, age, phone, email, dpi, password, reset_token, reset_token_expiration)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [userId, name, last_name, age, phone, email, dpi, password, null, null], (err, rows) => {
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

const updateRol = (idUser, idRol) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "update user_permission SET permission_id= ? where iduser= ? ;", [idRol, idUser], (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const updateUser = (_id, _name, _last_name, _age, _phone, _email, _dpi) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "update users SET name=?, last_name=?, age=?, phone=?, email=?, dpi=? where id= ? ;", [_name, _last_name, _age, _phone, _email, _dpi, _id], (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};

const updateTokeResetPasswordUser = (resetToken, resetTokenExpiration, email) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE users SET reset_token = ?, reset_token_expiration = ? WHERE email = ?", [resetToken, resetTokenExpiration, email], (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};


const resetPasswordUser = (_token) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiration > NOW()", [_token], (err, rows) => {
                if (err) reject(err)
                resolve(rows[0])
            });
    });
};

const updatePasswordUser = ( _hashedPassword, _token) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiration = NULL WHERE reset_token = ?",  [_hashedPassword, _token], (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            });
    });
};


const deleteUserId = (id) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `DELETE FROM users WHERE id = ${id};`, (err, rows) => {
                if (err) {
                    console.error('Error consultando a la base de datos:', err); // Registro del error en el servidor
                    return reject(new Error('Error al eliminar Usuario')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows[0])
            });
    });
};


module.exports = {
    getUserLogin,
    getAllUser,
    getCountUser,
    createUser,
    getUserDpi,
    addPermission,
    getUserByDpi,
    getUserByemail,
    getUserById,
    getPermission,
    updateRol,
    updateUser,
    deleteUserId,
    updateTokeResetPasswordUser ,
    resetPasswordUser,
    updatePasswordUser
}