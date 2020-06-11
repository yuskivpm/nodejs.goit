const fs = require('fs');
const path = require('path');

const contactPath = path.join(__dirname, 'db', 'contacts.json');

// helpers
const getMaxId = contacts => contacts.reduce((maxId, { id }) => Math.max(maxId, id), 0) + 1;
const prepareData = contacts => JSON.stringify(contacts, null, 2);
const getIndexById = (contacts, contactId) => contacts.findIndex(({ id }) => id == contactId);
const listContacts = () => fs.promises.readFile(contactPath, 'utf8').then(data => JSON.parse(data));

// get all contacts
const getContactById = contactId => listContacts().then(contacts => contacts.find(({ id }) => id == contactId));

// get contact by id
async function removeContact(contactId) {
  const contacts = await listContacts();
  const contactIndex = getIndexById(contacts, contactId);
  const result = contactIndex >= 0;
  if (result) {
    await fs.promises.writeFile(contactPath, prepareData(contacts.filter((value, index) => index !== contactIndex)));
  }
  return result;
}

// add new contact
async function addContact(name, email, phone) {
  let newItem;
  const contacts = await listContacts();
  await fs.promises.writeFile(
    contactPath,
    prepareData(contacts.concat((newItem = { id: getMaxId(contacts), name, email, phone })))
  );
  return newItem;
}

// update existing contact
async function updateContact(contactId, update) {
  let resultContact;
  const contacts = await listContacts();
  const contactIndex = getIndexById(contacts, contactId);
  if (contactIndex >= 0) {
    resultContact = Object.assign(contacts[contactIndex], update);
    await fs.promises.writeFile(contactPath, prepareData(contacts));
  }
  return resultContact;
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
