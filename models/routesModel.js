const connection = require('../config/conexion');

const createRoute = (data) => { //getByEmail
    return new Promise((resolve, reject) => {
        connection.query(
            `INSERT INTO routes (idUser, 
    start_lat,  
    start_lng, 
    end_lat,  
    end_lng,  
    total_distance, 
    total_time) VALUES (?,?,?,?,?,?,?)`, [data.idUser,
        data.start_lat,
        data.start_lng,
        data.end_lat,
        data.end_lng,
        data.total_distance,
        data.total_time], (err, rows) => {
            if (err) {
                console.error('Error getting record:', err); // Registro del error en el servidor
                return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
            }
            resolve(rows);
        });
    });
};


const updateLocation = (lat, lng, idUser) => {
    return new Promise((resolve, reject) => {
        connection.query(
            "update locations set lat=?, lng=?, timestamp = NOW() WHERE idUser= ?", [lat, lng, idUser], (err, rows) => {
                if (err) {
                    console.error('Error getting record:', err); // Registro del error en el servidor
                    return reject(new Error('Error getting record')); // Rechazo con un mensaje de error personalizado
                }
                resolve(rows[0]);
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

module.exports = {
    createRoute,
    getLocationId,
    updateLocation
}