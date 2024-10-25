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

isRouter.get('/idRoute', authMiddleware.protect, async (req, res) => {
    try {
        const _id = req.query.id;
        const results = await isController.getRouteId(_id);
        if (results === undefined) {
            res.json({
                error: 'Error, No existen registros!'
            })
        } else {
            const data =  await isController.getRoutePoint(results.id);

            return res.status(200).json({
                results: {route: results, points: data}
            });
        }

    } catch (error) {
        console.error('Error al obtener los roles:', error);

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


isRouter.get('/idUser', authMiddleware.protect, async (req, res) => {
    try {
        const _id = req.query.id;
        const _page = parseInt(req.query.page) || 1;
        const _limit = parseInt(req.query.limit) || 10;
        const _offset = (_page - 1) * _limit;


        const results = await isController.getRouteRolIdUser(_limit, _offset, _id);
        if (results === undefined) {
            res.json({
                error: 'Error, No existen registros!'
            })
        } else {

            const totalUsers = results.total;
            const totalPages = Math.ceil(totalUsers / _limit);
            return res.status(200).json({
                users: results,
                currentPage: _page,
                totalPages: totalPages,
                totalUsers: totalUsers
            });

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

isRouter.get('/all-routes', authMiddleware.protect, async (req, res) => {
    try {
        const _id = req.query.id;
        const _page = parseInt(req.query.page) || 1;
        const _limit = parseInt(req.query.limit) || 10;
        const _offset = (_page - 1) * _limit;

        const results = await isController.getRouteAll(_limit, _offset);
        if (results === undefined) {
            res.json({
                error: 'Error, No existen registros!'
            })
        } else {

            const totalUsers = results.total;
            const totalPages = Math.ceil(totalUsers / _limit);
            return res.status(200).json({
                users: results,
                currentPage: _page,
                totalPages: totalPages,
                totalUsers: totalUsers
            });

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
        const routes = req.body.routes;
        const results = await isController.createRoute(req.body);
        if (!results || results.insertId === undefined) {
            return res.status(500).json({ message: "Error al crear la ruta principal" });
        }

        if (routes && routes.length > 0) {
            for (const route of routes) {
                const resulPoint = await isController.createRoutePoint(results.insertId, route);

                // Si createRoutePoint falla, responde y detiene el proceso
                if (!resulPoint) {
                    return res.status(500).json({ message: "Error en createRoutePoint", data: resulPoint });
                }
            }
        }


        // Si todo es exitoso, responde con el ID de la ruta creada
        return res.status(201).json({ message: "Ruta creada exitosamente", routeId: results.insertId });


    } catch (error) {

    }
})

isRouter.put('/update-status-route', authMiddleware.protect, async (req, res) => {
    try {
        const { status, idUser, idRoute, } = req.body;
        const results = await isController.updateStatusRoute(status, idUser, idRoute);
        if (results === undefined) {
            res.json({
                error: 'Error, No existe registro!'
            })
        } else {
            return res.status(200).json({
                msg: 'Successful Update',
            });
        }

    } catch (error) {
        console.error('Error al actualizar Estado de la Ruta:', error);  // Verificamos el código de error

        // Manejo de errores según el código
        switch (error.code) {
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


isRouter.delete('/delete-route/:id', async (req, res) => {
    try {
        const results = await isController.deleteRouteId(req.params.id);
        if (results === undefined) {
          res.json({
            error: 'Error, No existe cuenta'
          })
        } else {
          return res.status(200).json({
            result: '¡Delete Success!'
          });
        }
      
    } catch (err) {
      console.error('Error al eliminar:', err); 
  
     switch (error.code) {
        case 'ER_DUP_ENTRY':
          return res.status(400).json({
            error: error.sqlMessage
          });
  
        case 'ER_BAD_FIELD_ERROR':
          return res.status(400).json({
            error: 'Error en la solicitud: el campo proporcionado no es válido.'
          });
  
        case 'ER_NO_REFERENCED_ROW':
        case 'ER_ROW_IS_REFERENCED':
          return res.status(409).json({
            error: 'No puedes realizar esta acción porque hay registros relacionados en otra tabla.'
          });
  
        case 'ER_DATA_TOO_LONG':
          return res.status(400).json({
            error: 'Uno de los campos supera la longitud permitida.'
          });
  
        default:
          return res.status(500).json({
            error: 'Ocurrió un error inesperado al actualizar la cuenta.'
          });
      }
  
    }
  })

module.exports = isRouter;