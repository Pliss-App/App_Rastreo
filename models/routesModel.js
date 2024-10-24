const connection = require('../config/conexion');

const createRoute = (data) => { //getByEmail
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
            "SELECT * FROM locations WHERE 1", (err, rows) => {
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
            "SELECT * FROM routes WHERE idUser = ? LIMIT ? OFFSET ?", [_id, _limit, _offset], (err, rows) => {
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
            `SELECT us.name, us.last_name, r.* FROM routes r
            INNER JOIN users us
            ON r.idUser = us.id LIMIT ? OFFSET ?`, 
        [_limit, _offset], (err, rows) => {
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
    updateStatusRoute
}