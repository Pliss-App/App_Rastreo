const express = require('express');
const userRouter = require('../controller/userController');
const menuRouter = require('../controller/menuController');
const rouRouter = require('../controller/routesController');

const apiRouter = express.Router();

apiRouter.use('/menu_drawer', menuRouter);
apiRouter.use('/user', userRouter);
apiRouter.use('/route', rouRouter);

module.exports = apiRouter;