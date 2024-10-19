// Imports
require('dotenv').config();
const express = require("express");
//const connection = require('./mysql');
const multer = require('multer')
const fs = require('fs')
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//-----------------------------------------------------------------------
const app = express()

//
app.use(express.json({limit: '90mb'}));
app.use(express.urlencoded({limit: '90mb', extended: true, parameterLimit: 90000}));

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

//

const apiRoutes = require('./routes/list');

app.use('/api', apiRoutes);

// Manejo de errores (ejemplo simple)
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error'
    });
  });

// Arrancar Servidor
// set port, listen for requests
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});