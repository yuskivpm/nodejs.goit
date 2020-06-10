const fs = require('fs');
const path = require('path');

const contactPath = path.join('./db', 'contacts.json');

const getMaxId = contacts => contacts.reduce((maxId, { id }) => Math.max(maxId, id), 0) + 1;

const prepareData = contacts => JSON.stringify(contacts, null, 2);

const updateContacts = mapFunction =>
  listContacts().then(contacts => fs.promises.writeFile(contactPath, prepareData(mapFunction(contacts))));

const listContacts = () => fs.promises.readFile(contactPath, 'utf8').then(data => JSON.parse(data));

const getContactById = contactId => listContacts().then(contacts => contacts.find(({ id }) => id === contactId));

const removeContact = contactId => updateContacts(contacts => contacts.filter(({ id }) => id !== contactId));

function addContact(name, email, phone) {
  let newItem;
  return updateContacts(contacts => contacts.concat(newItem = { id: getMaxId(contacts), name, email, phone }))
    .then(() => newItem);
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact
}
