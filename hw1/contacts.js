const fs = require('fs');
const path = require('path');

const contactPath = path.join('./db', 'contacts.json');

const emptyCallback = () => { };

const getMaxId = contacts => contacts.reduce((maxId, { id }) => Math.max(maxId, id), 0) + 1;

const prepareData = contacts => JSON.stringify(contacts, null, 2);

function processResult(err, callback = emptyCallback, ...args) {
  if (err) {
    throw err;
  }
  callback(...args);
}

const updateContacts = (mapFunction, callback) => listContacts(
  contacts => fs.writeFile(contactPath, prepareData(mapFunction(contacts)), err => processResult(err, callback))
);

const listContacts = callback =>
  fs.readFile(contactPath, 'utf8', (err, data = {}) => processResult(err, callback, JSON.parse(data)));

const getContactById = (contactId, callback) =>
  listContacts(contacts => callback(contacts.find(({ id }) => id === contactId)));

const removeContact = (contactId, callback) =>
  updateContacts(contacts => contacts.filter(({ id }) => id !== contactId), callback);

function addContact(name, email, phone, callback) {
  let newItem;
  updateContacts(
    contacts => contacts.concat(newItem = { id: getMaxId(contacts), name, email, phone }),
    () => callback(newItem)
  );
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact
}
