const express = require('express');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

  const { user, password } = req.body;

  const existingUser = await isController.getUserDpi(user);
  if (existingUser === undefined) {
    res.json('Error, No Existe usuario')
  } else {
    const equals = bcrypt.compareSync(password, existingUser.password);
    if (equals) {
      const token = jwt.sign({
        idUser: existingUser.id, name: existingUser.name, last_name: existingUser.last_name, email: existingUser.email, dpi: existingUser.dpi, phone: existingUser.phone
      },
        'SECRETKEY', {
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
})

isRouter.get('/all', async (req, res) => {
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

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
})

module.exports = isRouter;