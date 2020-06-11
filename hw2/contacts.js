const fs = require('fs');
const path = require('path');

const contactPath = path.join('./db', 'contacts.json');

const getMaxId = contacts => contacts.reduce((maxId, { id }) => Math.max(maxId, id), 0) + 1;

const prepareData = contacts => JSON.stringify(contacts, null, 2);

const getIndexById = (contacts, contactId) => contacts.findIndex(({ id }) => id == contactId);

const listContacts = () => fs.promises.readFile(contactPath, 'utf8').then(data => JSON.parse(data));

const getContactById = contactId => listContacts().then(contacts => contacts.find(({ id }) => id == contactId));

const removeContact = contactId =>
  listContacts().then(contacts => {
    const contactIndex = getIndexById(contacts, contactId);
    if (contactIndex < 0) {
      return null;
    }
    contacts.splice(contactIndex, 1);
    return fs.promises.writeFile(contactPath, prepareData(contacts)).then(() => true);
  });

function addContact(name, email, phone) {
  let newItem;
  return listContacts()
    .then(contacts =>
      fs.promises.writeFile(
        contactPath,
        prepareData(contacts.concat((newItem = { id: getMaxId(contacts), name, email, phone })))
      )
    )
    .then(() => newItem);
}

function updateContact(contactId, update) {
  let resultContact;
  return listContacts()
    .then(contacts => {
      const contactIndex = getIndexById(contacts, contactId);
      if (contactIndex >= 0) {
        contacts[contactIndex] = resultContact = { ...contacts[contactIndex], ...update };
        fs.promises.writeFile(contactPath, prepareData(contacts));
      }
    })
    .then(() => resultContact);
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
