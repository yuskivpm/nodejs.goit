const argv = require('yargs').argv;
const { listContacts, getContactById, addContact, removeContact } = require('./contacts');

const handlers = {
  list: () => listContacts(contacts => console.table(contacts)),
  get: ({ id }) => getContactById(id, contact => console.log(contact)),
  add: ({ name, email, phone }) => addContact(name, email, phone, newItem => console.log('Item added: ', newItem)),
  remove: ({ id }) => removeContact(id, () => console.log('Item removed')),
};

const invokeAction = ({ action, ...contactData }) =>
  handlers.hasOwnProperty(action) ? handlers[action](contactData) : console.warn('\x1B[31m Unknown action type!');

invokeAction(argv);
