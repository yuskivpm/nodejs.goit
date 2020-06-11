const argv = require('yargs').argv;
const { listContacts, getContactById, addContact, removeContact } = require('./contacts');

const handlers = {
  list: () => listContacts(contacts => console.table(contacts)),
  get: ({ id }) => getContactById(id, contact => console.log(contact)),
  add: ({ name, email, phone }) => addContact(name, email, phone, newItem => console.log('Item added: ', newItem)),
  remove: ({ id }) => removeContact(id, () => console.log('Item removed')),
};

const invokeAction = ({ action, ...args }) =>
  handlers[action] ? handlers[action](args) : console.warn('\x1B[31m Unknown action type!');

invokeAction(argv);
