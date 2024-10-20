const express = require('express');
require('dotenv').config();
const timeout = require('connect-timeout');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');
const isRouter = express.Router();

const isController = require('../models/userModels');

isRouter.post('/register', async (req, res) => {
  try {
    const { name, last_name, age, phone, email, dpi, password } = req.body;
    // Verificar si el usuario ya existe
    const existingUser = await isController.getUserDpi(dpi);
    if (existingUser) {
      return res.status(400).json({ message: 'Usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await isController.createUser({
      name,
      last_name,
      age: req.body.age,
      phone: req.body.phone,
      email,
      dpi,
      password: hashedPassword
    });

    const permission = await isController.addPermission(result.insertId);

    res.status(200).json(result); // Envío si la consulta fue exitosa

  } catch (error) {
    console.error('Error the create account:', error); // Registro del error en el servidor

    // Si el error es debido a la tabla no existente, capturarlo aquí
    if (error.original && error.original.code === 'ER_NO_SUCH_TABLE') {
      res.status(500).json({ error: 'La tabla "user" no existe en la base de datos.' });
    } else {
      // Otros errores de base de datos
      res.status(500).json({ error: 'Ocurrió un error al obtener los datos del usuario.' });
    }
    // res.status(500).json({ error: 'Error the create account.' }); // Respuesta con error al cliente
  }
})


isRouter.post('/login', async (req, res) => {
  if (!req.timedout) {
    const { user, password } = req.body;

    const existingUser = await isController.getUserLogin(user);

    if (existingUser === undefined) {
      res.json('Error, No Existe usuario')
    } else {
      const equals = bcrypt.compareSync(password, existingUser.password);
      if (equals) {


        const token = jwt.sign({
          idUser: existingUser.id, idpermission: existingUser.idPermission, rol: existingUser.rol, name: existingUser.name, last_name: existingUser.last_name, email: existingUser.email, dpi: existingUser.dpi, phone: existingUser.phone
        },
          process.env.JWT_SECRET, {
          expiresIn: '7h'
        }
        );

        return res.status(200).send({
          msg: 'Logged in!',
          token,
          result: true,
          user: existingUser
        });
      } else {
        res.json('Error, Contrasenia incorrecta')
      }
    }
  } else {
    res.status(503).json({ error: 'La solicitud ha caducado' });
  }
})

isRouter.get('/all', authMiddleware.protect, async (req, res) => {
  try {

    const _page = parseInt(req.query.page) || 1; // Página solicitada
    const _limit = parseInt(req.query.limit) || 10; // Tamaño de página (número de registros por página)
    const _offset = (_page - 1) * _limit; // Determina desde qué registro iniciar

    const results = await isController.getAllUser(_limit, _offset);
    if (results === undefined) {
      res.json({
        error: 'Error, Datos no encontrados'
      })
    } else {

      const countRows = await isController.getCountUser();
      if (countRows === undefined) {
        res.json({
          error: 'Error, durante conteo de registros.'
        })
      } else {

        const totalUsers = countRows.total;
        const totalPages = Math.ceil(totalUsers / _limit);
        return res.status(200).json({
          users: results,
          currentPage: _page,
          totalPages: totalPages,
          totalUsers: totalUsers
        });
      }
    }

  }catch (error) {
    console.error('Error the create account:', error); // Registro del error en el servidor
    // Si el error es debido a la tabla no existente, capturarlo aquí ER_NON_UNIQ_ERROR
    if (error.original && error.original.code === 'ER_NO_SUCH_TABLE') {
      res.status(500).json({ error: 'La tabla "user" no existe en la base de datos.' });
    } else if (error.original && error.original.code === 'ER_NON_UNIQ_ERROR') {
      res.status(500).json({ error: 'Error table :  ER_NON_UNIQ_ERROR' });
    } {
      // Otros errores de base de datos
      res.status(500).json({ error: 'Ocurrió un error al actualizar el usuario.' });
    }
  }
})


isRouter.get('/validate-dpi', async (req, res) => {
  try {

    const results = await isController.getUserByDpi(req.query.valor);
    if (results === undefined) {
      res.json({
        result: 'DPI, No existe cuenta'
      })
    } else {
      return res.status(200).json({
        result: 'DPI, se encuentra asociada a una cuenta Activa'
      });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
})

isRouter.get('/userById', authMiddleware.protect, async (req, res) => {
  try {

    const results = await isController.getUserById(req.query.id);
    if (results === undefined) {
      res.json({
        error: 'No existe el registro!'
      })
    } else {
      return res.status(200).json({
        msg: 'Success',
        result: results
      });
    }

  } catch (error) {
    console.error('Error the create account:', error); // Registro del error en el servidor
    // Si el error es debido a la tabla no existente, capturarlo aquí ER_NON_UNIQ_ERROR
    if (error.original && error.original.code === 'ER_NO_SUCH_TABLE') {
      res.status(500).json({ error: 'La tabla "user" no existe en la base de datos.' });
    } else if (error.original && error.original.code === 'ER_NON_UNIQ_ERROR') {
      res.status(500).json({ error: 'Error table :  ER_NON_UNIQ_ERROR' });
    } {
      // Otros errores de base de datos
      res.status(500).json({ error: 'Ocurrió un error al obtener los datos del usuario.' });
    }
  }
})

isRouter.get('/permission', authMiddleware.protect, async (req, res) => {
  try {

    const results = await isController.getPermission();
    if (results === undefined) {
      res.json({
        error: 'Error, No existen registros!'
      })
    } else {
      return res.status(200).json({
        msg: 'Success',
        result: results
      });
    }

  } catch (error) {
    console.error('Error the create account:', error); // Registro del error en el servidor
    // Si el error es debido a la tabla no existente, capturarlo aquí ER_NON_UNIQ_ERROR
    if (error.original && error.original.code === 'ER_NO_SUCH_TABLE') {
      res.status(500).json({ error: 'La tabla "user" no existe en la base de datos.' });
    } else if (error.original && error.original.code === 'ER_NON_UNIQ_ERROR') {
      res.status(500).json({ error: 'Error table :  ER_NON_UNIQ_ERROR' });
    } {
      // Otros errores de base de datos
      res.status(500).json({ error: 'Ocurrió un error al obtener los datos del usuario.' });
    }
  }
})

isRouter.put('/update-rol', authMiddleware.protect, async (req, res) => {
  try {
    const { idUser, idRol } = req.body;
    const results = await isController.updateRol(idUser, idRol);
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
    console.error('Error the create account:', error); // Registro del error en el servidor
    // Si el error es debido a la tabla no existente, capturarlo aquí ER_NON_UNIQ_ERROR
    if (error.original && error.original.code === 'ER_NO_SUCH_TABLE') {
      res.status(500).json({ error: 'La tabla "user" no existe en la base de datos.' });
    } else if (error.original && error.original.code === 'ER_NON_UNIQ_ERROR') {
      res.status(500).json({ error: 'Error table :  ER_NON_UNIQ_ERROR' });
    } {
      // Otros errores de base de datos
      res.status(500).json({ error: 'Ocurrió un error al actualizar el permiso.' });
    }
  }
})

isRouter.put('/update-user', authMiddleware.protect, async (req, res) => {
  try {
    const { idUser, name, last_name, age, phone, email, dpi } = req.body;
    const results = await isController.updateUser(idUser, name, last_name, age, phone, email, dpi);
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
    console.error('Error the create account:', error); // Registro del error en el servidor
    // Si el error es debido a la tabla no existente, capturarlo aquí ER_NON_UNIQ_ERROR
    if (error.original && error.original.code === 'ER_NO_SUCH_TABLE') {
      res.status(500).json({ error: 'La tabla "user" no existe en la base de datos.' });
    } else if (error.original && error.original.code === 'ER_NON_UNIQ_ERROR') {
      res.status(500).json({ error: 'Error table :  ER_NON_UNIQ_ERROR' });
    } {
      // Otros errores de base de datos
      res.status(500).json({ error: 'Ocurrió un error al actualizar el usuario.' });
    }
  }
})

isRouter.get('/validate-email', async (req, res) => {
  try {
    const results = await isController.getUserByemail(req.query.valor);
    if (results === undefined) {
      res.json({
        error: 'EMAIL, No existe cuenta'
      })
    } else {
      return res.status(200).json({
        result: 'Email, se encuentra asociada a una cuenta Activa'
      });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
})

module.exports = isRouter;