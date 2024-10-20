const express = require('express');
require('dotenv').config();
const timeout = require('connect-timeout');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const authMiddleware = require('../middlewares/authMiddleware');
const isRouter = express.Router();

const isController = require('../models/userModels');

isRouter.post('/register', async (req, res) => {
  try {
    const { name, last_name, age, phone, email, dpi, password } = req.body;
    const userId = uuidv4(); // Genera un ID único

    const results = await isController.getUserDpi(dpi);
    if (results === undefined) {

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await isController.createUser({
        userId,
        name,
        last_name,
        age: req.body.age,
        phone: req.body.phone,
        email,
        dpi,
        password: hashedPassword
      });

      const permission = await isController.addPermission(result.insertId);

      return res.status(200).json(result); // Envío si la consulta fue exitosa
    } else {
      return res.status(200).json({
        msg: 'DPI o EMAIL, vinculados a otra cuenta existente.',
      });
    }
    /*// Verificar si el usuario ya existe
    const existingUser = await isController.getUserDpi(dpi);
    if (existingUser) {
      return res.status(400).json({ message: 'Usuario ya existe' });
    } */

  } catch (error) {
    console.error('Error durante el registro:', error);  // Verificamos el código de error

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
          error: error.sqlMessage
        });

      case 'ER_NO_REFERENCED_ROW':
      case 'ER_ROW_IS_REFERENCED':
        // Error de violación de llave foránea (cuando estás eliminando o insertando un valor que tiene dependencias)
        console.error('Violación de llave foránea.');
        return res.status(409).json({
          error: error.sqlMessage
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


isRouter.post('/login', async (req, res) => {

  try {


    if (!req.timedout) {
      const { user, password } = req.body;

      const existingUser = await isController.getUserLogin(user);

      if (existingUser === undefined) {
        res.json('Error, Correo o DPI no registrados.')
      } else {
        const equals = bcrypt.compareSync(password, existingUser.password);
        if (equals) {


          const token = jwt.sign({
            idUser: existingUser.id, idpermission: existingUser.idPermission, rol: existingUser.rol, name: existingUser.name, last_name: existingUser.last_name, email: existingUser.email, dpi: existingUser.dpi, phone: existingUser.phone
          },
            process.env.JWT_SECRET, {
            expiresIn: '1h'
          }
          );

          return res.status(200).send({
            msg: 'Logged in!',
            token,
            result: true,
            user: existingUser
          });
        } else {
          res.json('Error, Contrasenia Incorrecta')
        }
      }
    } else {
      res.status(503).json({ error: 'La solicitud ha caducado' });
    }
  } catch (error) {
    console.error('Error durante el logeo:', error);  // Verificamos el código de error

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

isRouter.get('/all', authMiddleware.protect, async (req, res) => {
  try {
    const _rol = req.query.rol; // Página solicitada
    const _page = parseInt(req.query.page) || 1; // Página solicitada
    const _limit = parseInt(req.query.limit) || 10; // Tamaño de página (número de registros por página)
    const _offset = (_page - 1) * _limit; // Determina desde qué registro iniciar

    const results = await isController.getAllUser(_limit, _offset, _rol);
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
    console.error('Error al actualizar el rol:', error);  // Verificamos el código de error

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
    console.error('Error al actualizar la cuenta:', error);  // Verificamos el código de error

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

isRouter.delete('/delete-user/:id', async (req, res) => {
  try {

    if (!req.timedout) {
      const results = await isController.deleteUserId(req.params.id);
      if (results === undefined) {
        res.json({
          error: 'Error, No existe cuenta'
        })
      } else {
        return res.status(200).json({
          result: '¡Delete Success!'
        });
      }
    }
  } catch (err) {
    console.error('Error al actualizar la cuenta:', error);  // Verificamos el código de error

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

isRouter.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    const results = await isController.getUserDpi(email);
    if (results === undefined) {
      res.json({
        error: 'Error, No existe cuenta'
      })
    } else {

      // Generar token y la fecha de expiración (ej. 1 hora)
      const _resetToken = uuidv4();
      const _resetTokenExpiration = new Date(Date.now() + 3600000); // Expira en 1 hora

      const update = await isController.updateTokeResetPasswordUser(_resetToken, _resetTokenExpiration, email);
      if (update === undefined) {
        res.json({
          error: 'Error, No existe cuenta'
        })
      } else {

        // Configurar el transporte de nodemailer
        const transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: process.env.GMAIL_USER, // Tu correo
            pass: process.env.GMAIL_APP_PASSWORD, // La contraseña específica de la aplicación
         
            user: 'perezlib49@gmail.com',
            pass: 'rwxv mhoi gviv pzzi',
          },
        });

        // Enviar el correo con el enlace de restablecimiento
        const resetUrl = `${process.env.API_URL}/reset-password/${_resetToken}`;
        const mailOptions = {
          from: process.env.GMAIL_USER,
          to: email,
          subject: 'Restablecer Contraseña',
          html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
           <a href="${resetUrl}">Restablecer Contraseña</a>`,
        };

        await transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("EERO ", error)
            return res.status(500).send(error.toString());
          }
          res.status(200).send('Correo enviado: ' + info.response);
        });
      }


    }
  } catch (error) {

  }
})

isRouter.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
console.log(token)
    const results = await isController.resetPasswordUser(token);
    if (results === undefined) {
    return  res.json({
        message: 'Token inválido o expirado'
      })
    } else {
      // Hashear la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const update = await isController.updatePasswordUser(hashedPassword, token)
      if (update  === undefined) {
        return res.status(400).json({ message: 'Error, No se pudo actualizar la contraseña.' });
      } else {
        res.json({ message: 'Contraseña actualizada correctamente' });
      }

    }
  } catch (error) {
    console.error("Error Producido", error)
  }
})

module.exports = isRouter;