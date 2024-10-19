const { database } = require('./config');
const { Pool } = require('pg');

const connection = new  Pool(database)

module.exports = connection;