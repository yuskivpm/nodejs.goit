const argv = require('yargs').argv;
const { listContacts, getContactById, addContact, removeContact } = require('./contacts.promises');

function invokeAction({ action, id, name, email, phone }) {
  let logThis;
  switch (action) {
    case 'list':
      logThis = listContacts();
      break;

    case 'get':
      logThis = getContactById(id);
      break;

    case 'add':
      logThis = addContact(name, email, phone);
      break;

    case 'remove':
      logThis = removeContact(id).then(() => 'Item removed');
      break;

    default:
      logThis = Promise.reject('\x1B[31m Unknown action type!');
  }
  logThis.then(data => console.log(data || '')).catch(err => console.warn(err));
}

invokeAction(argv);
