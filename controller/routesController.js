const express = require('express');
require('dotenv').config();
const timeout = require('connect-timeout');
const authMiddleware = require('../middlewares/authMiddleware');
const isRouter = express.Router();

const isController = require('../models/routesModel');

isRouter.get('/allDevices', authMiddleware.protect, async (req, res) => {
    try {

        const results = await isController.getDevicesAll();
        if (results === undefined) {
            res.json({
                error: 'Error, No existen registros!'
            })
        } else {

            res.json(results);

          /*  return res.status(200).json({
                msg: 'Success',
                result: results
            }); */
        }

    } catch (error) {
        console.error('Error al obtener los roles:', error);  // Verificamos el código de error

        // Manejo de errores según el código
        switch (error.code) {
            case 'ER_NO_SUCH_TABLE':

                return res.status(400).json({
                    error: error.sqlMessage
                });
            case 'ER_DUP_ENTRY':
                // Error de entrada duplicada (ej. DPI o email ya existen en la base de datos)
                console.error('DPI o correo electrónico ya existe.');
                return res.status(400).json({
                    error: error.sqlMessage
                });

            case 'ER_BAD_FIELD_ERROR':
                // Error de campo incorrecto (cuando un campo de la consulta no existe en la base de datos)
                console.error('Campo no válido en la consulta.');
                return res.status(400).json({
                    error: 'Error en la solicitud: el campo proporcionado no es válido.'
                });

            case 'ER_NO_REFERENCED_ROW':
            case 'ER_ROW_IS_REFERENCED':
                // Error de violación de llave foránea (cuando estás eliminando o insertando un valor que tiene dependencias)
                console.error('Violación de llave foránea.');
                return res.status(409).json({
                    error: 'No puedes realizar esta acción porque hay registros relacionados en otra tabla.'
                });

            case 'ER_DATA_TOO_LONG':
                // Error de longitud de dato (cuando intentas insertar un valor que excede la longitud permitida)
                console.error('Dato demasiado largo para uno de los campos.');
                return res.status(400).json({
                    error: 'Uno de los campos supera la longitud permitida.'
                });

            default:
                // Cualquier otro error no manejado específicamente
                console.error('Error inesperado:', error);
                return res.status(500).json({
                    error: 'Ocurrió un error inesperado al actualizar la cuenta.'
                });
        }
    }
})

isRouter.post('/add-route', async (req, res) => {
    try {
        const results = await isController.createRoute(req.body);
        if (results === undefined) {
            return res.status(200).json(result);

        } else {

            return res.status(200).json({
                msg: 'Success',
            });
        }
    } catch (error) {

    }
})

module.exports = isRouter;