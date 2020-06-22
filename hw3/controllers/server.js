require('dotenv').config();

/**
 * @ startServer
 *
 * Prepare and execute http server
 * Use "SERVER_POST" in ".env" to change default port number
 */

module.exports = function startServer() {
  const express = require('express');

  const PORT = process.env.SERVER_POST || 3000;
  const API_CONTACTS = '/api/contacts';

  const contactsRouter = require('./routers/contactsApi');
  const { handleException } = require('../utils/utils');

  express()
    .use(express.json(), handleException)
    .use(require('cors')())
    .use(require('morgan')('combined'))
    .use(API_CONTACTS, contactsRouter)
    .listen(PORT, () => console.log('Server start'));
};
