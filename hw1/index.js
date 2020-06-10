const argv = require('yargs').argv;
const { listContacts, getContactById, addContact, removeContact } = require('./contacts');

function invokeAction({ action, id, name, email, phone }) {
  switch (action) {
    case 'list':
      listContacts(contacts => console.table(contacts));
      break;

    case 'get':
      getContactById(id, contact => console.log(contact));
      break;

    case 'add':
      addContact(name, email, phone, newItem => console.log('Item added: ', newItem));
      break;

    case 'remove':
      removeContact(id, () => console.log('Item removed'));
      break;

    default:
      console.warn('\x1B[31m Unknown action type!');
  }
}

invokeAction(argv);
