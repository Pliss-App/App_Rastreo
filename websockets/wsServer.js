const WebSocket = require('ws');
const isController = require('../models/routesModel');

const createWebSServer = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('Cliente conectado al WebSocket');

        // Recibir mensajes del cliente (coordenadas en tiempo real)
        ws.on('locations', async (message) => {
            const { lat, lng, idUser } = JSON.parse(message);
            console.log(`Latitud: ${lat}, Longitud: ${lng}, DeviceID: ${idUser}`);
            const loctionUser = await isController.getLocationId(idUser);
            if (loctionUser === undefined) {
                const query = 'INSERT INTO locations (idUser, lat, lng, timestamp) VALUES (?, ?, ?, NOW())';
                db.query(query, [deviceId, latitude, longitude], (err, result) => {
                    if (err) throw err;
                    console.log('Coordenadas almacenadas');
                });
            } else {
                const updateLocation = await isController.updateLocation(lat, lng, idUser);
                if (loctionUser === undefined) {
                    console.log('Error al Actualizar las coordenadas');
                } else {
                    console.log('Coordenadas actualizadas.');
                }
            } 


        });

        ws.on('close', () => {
            console.log('Cliente desconectado');
        });
    });

    console.log('Servidor WebSocket creado');
}

module.exports = createWebSServer;