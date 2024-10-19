const express = require('express');
const userRouter = require('../controller/userController');

const apiRouter = express.Router();

apiRouter.use('/user', userRouter);

module.exports = apiRouter;