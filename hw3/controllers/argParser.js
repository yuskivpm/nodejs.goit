const { handleError } = require('../utils/utils');

const {
  listContacts: list,
  getContactById,
  addContact: add,
  removeContact,
  updateContact,
} = require('../models/contactDao');

const { closeDb } = require('../utils/dbUtils');

const handlers = {
  list,
  get: ({ id }) => getContactById(id),
  add,
  remove: ({ id }) => removeContact(id),
  update: ({ id, contact = '{}' }) => updateContact(id, JSON.parse(contact)),
};

const invokeAction = ({ action, ...contactData }) =>
  handlers.hasOwnProperty(action)
    ? handlers[action](contactData)
        .then((data = '') => console.log(data))
        .catch(handleError)
        .finally(() => closeDb().then(() => process.exit(console.log('Connection closed') || 0)))
    : false;

/**
 * CLI
 *
 * USAGE:
 * @ node index.js --action="list"
 * get all contacts list
 *
 * @ node index.js --action="get" --id=5
 * receive contact by its ID
 *
 * @ node index.js --action="add" --name="Mango" --email="mango@gmail.com" --phone="322-22-22"
 * create a new contact
 *
 * @ node index.js --action="remove" --id=3
 * remove contact by its ID
 */
module.exports = () => invokeAction(require('yargs').argv);
