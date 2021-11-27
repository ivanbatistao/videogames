const { Pool } = require('pg');
const config = require('../config/config');

const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.dbPassword);
const URI = `postgres://${USER}:${PASSWORD}@${config.dbHost}/${config.dbName}`;

const pool = new Pool({ connentionString: URI});

module.exports = pool;
