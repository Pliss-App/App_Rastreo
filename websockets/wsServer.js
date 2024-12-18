const WebSocket = require('ws');
const isController = require('../models/routesModel');

const createWebSServer = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        setInterval(async () => {
            const results = await isController.getDevicesAll();
            if (results === undefined) {
                console.log("NO EXISTEN REGISTROS...")
            } else {
                ws.send(JSON.stringify(results));
            }
        }, 5000);

        ws.on('message', async (message) => {
            const { lat, lng, idUser } = JSON.parse(message);
            const loctionUser = await isController.getLocationId(idUser);
            if (loctionUser === undefined) {
                const insert = await isController.insertLocation(lat, lng, idUser);
            } else {
                setInterval(async () => {
                    const updateLocation = await isController.updateLocation(lat, lng, idUser);

                    if (updateLocation === undefined) {
                        console.log('Error al Actualizar las coordenadas');
                    } 
                }, 6000);
            }
        });

        ws.on('close', () => {
            console.log('Cliente desconectado');
        });
    });

    console.log('Servidor WebSocket creado');
}

module.exports = createWebSServer;