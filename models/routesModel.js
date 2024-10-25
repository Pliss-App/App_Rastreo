const connection = require('../config/conexion');

const createRoute = (data) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `INSERT INTO routes (idUser, 
            start_direction,
    start_lat,  
    start_lng, 
     end_direction,
    end_lat,  
    end_lng,  
    total_distance, 
    total_time, 
    status) VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [data.idUser,
            data.start_direction,
            data.start_lat,
            data.start_lng,
            data.end_direction,
            data.end_lat,
            data.end_lng,
            data.total_distance,
            data.total_time,
                'Asignado'], (err, rows) => {
                    if (err) {
                        console.error('Error getting record:', err); // Registro del error en el servidor
                        return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                    }
                    resolve(rows);
                });
    });
};

const createRoutePoint = (idroute, data) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `INSERT INTO route_point (idroute,
     direction,
    lat,  
    lng,  
    distance, 
    time) VALUES (?,?,?,?,?,?)`,
            [idroute,
                data.direction,
                data.lat,
                data.lng,
                data.distance,
                data.time], (err, rows) => {
                    if (err) {
                        console.error('Error getting record:', err); // Registro del error en el servidor
                        return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                    }
                    resolve(rows);
                });
    });
};


const insertLocation = (lat, lng, idUser) => {
    return new Promise((resolve, reject) => {
        connection.query(
            'INSERT INTO locations (idUser, lat, lng, timestamp) VALUES (?, ?, ?, NOW())', [idUser, lat, lng], (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows);
            });
    });
}


const updateLocation = (lat, lng, idUser) => {
    return new Promise((resolve, reject) => {
        connection.query(
            "update locations set lat=?, lng=?, timestamp = NOW() WHERE idUser= ?", [lat, lng, idUser], (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows);
            });
    });
}

const updateStatusRoute = (status, idUser, idRoute) => {
    return new Promise((resolve, reject) => {
        connection.query(
            "update routes set status=? WHERE idUser= ? AND id=?", [status, idUser, idRoute], (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows);
            });
    });
}



const getLocationId = (_id) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM locations WHERE idUser = ?", [_id], (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows[0]);
            });
    });
};

const getRouteId = (_id) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM routes WHERE id = ?", [_id], (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows[0]);
            });
    });
};

const getDevicesAll = (_id) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT lo.*
                from locations lo
                inner join users us
                ON lo.idUser =  us.id
                INNER JOIN user_permission up
                ON us.id = up.iduser
                INNER JOIN permission p 
                ON up.permission_id = p.id WHERE p.nombre_permiso='cliente'`,
            (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows);
            });
    });
};

const getRouteRolIdUser = (_limit, _offset, _id) => {

    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT us.name, us.last_name, r.*,  COALESCE(GROUP_CONCAT(rp.direction ORDER BY rp.id SEPARATOR ', '), NULL) AS additional_directions FROM routes r
            INNER JOIN users us
            ON r.idUser = us.id
           LEFT JOIN   route_point rp
            ON rp.idroute = r.id
            where r.idUser= ?
            GROUP BY r.id  LIMIT ? OFFSET ?`, [_id, _limit, _offset], (err, rows) => {
            if (err) {
                console.error('Error getting record:', err); // Registro del error en el servidor
                return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
            }
            resolve(rows);
        });
    });
};

const getRouteAll = (_limit, _offset,) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT us.name, us.last_name, r.*,  COALESCE(GROUP_CONCAT(rp.direction ORDER BY rp.id SEPARATOR ', '), NULL) AS additional_directions FROM routes r
            INNER JOIN users us
            ON r.idUser = us.id
           LEFT JOIN   route_point rp
            ON rp.idroute = r.id
            GROUP BY 
    r.id LIMIT ? OFFSET ?`,
            [_limit, _offset], (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows);
            });
    });
};

const getRoutePoint = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT * FROM route_point where idroute = ?`,
            [id], (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows);
            });
    });
};

const deleteRouteId = (id) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `DELETE FROM routes WHERE id = ${id};`,
            (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows);
            });
    });
};

module.exports = {
    createRoute,
    getLocationId,
    updateLocation,
    insertLocation,
    getDevicesAll,
    getRouteRolIdUser,
    getRouteAll,
    getRouteId,
    updateStatusRoute,
    createRoutePoint,
    deleteRouteId,
    getRoutePoint
}