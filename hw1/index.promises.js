const argv = require('yargs').argv;
const { listContacts, getContactById, addContact, removeContact } = require('./contacts.promises');

const handlers = {
  list: listContacts,
  get: ({ id }) => getContactById(id),
  add: ({ name, email, phone }) => addContact(name, email, phone),
  remove: ({ id }) => removeContact(id).then(() => 'Item removed'),
};

const invokeAction = ({ action, ...args }) =>
  (handlers[action] ? handlers[action](args) : Promise.reject('\x1B[31m Unknown action type!'))
    .then(data => console.table(data || '')).catch(err => console.warn(err));

invokeAction(argv);
