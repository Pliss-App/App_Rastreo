const express = require('express');
const userRouter = require('../controller/userController');
const menuRouter = require('../controller/menuController');

const apiRouter = express.Router();

apiRouter.use('/menu_drawer', menuRouter);
apiRouter.use('/user', userRouter);

module.exports = apiRouter;