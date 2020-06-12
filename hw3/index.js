const argv = require('yargs').argv;

const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  connectToDb,
  closeDb,
} = require('./contacts');

const handlers = {
  list: listContacts,
  get: ({ id }) => getContactById(id),
  add: addContact,
  remove: ({ id }) => removeContact(id),
  update: ({ id, contact = '{}' }) => updateContact(id, JSON.parse(contact)),
};

const handleError = ({ message = '' } = {}) => console.error('DB ERROR: ', message);

const invokeAction = ({ action, ...contactData }) =>
  handlers.hasOwnProperty(action)
    ? handlers[action](contactData)
        .then((data = '') => console.log(data))
        .catch(handleError)
        .finally(() => closeDb().then(() => process.exit(console.log('Connection closed') || 0)))
    : startServer();

connectToDb(handleError).then(error => {
  if (error) {
    process.exit(handleError(error) || 1);
  } else {
    console.log('Database connection successful');
    invokeAction(argv);
  }
});

function startServer() {
  const PORT = 3000;

  const CONTACT_ID = 'contactId';
  const API_CONTACTS = '/api/contacts';
  const API_CONTACT_BY_ID = `${API_CONTACTS}/:${CONTACT_ID}`;

  const sendResponse = (response, { code = 200, body = '' }) => response.status(code).send(body);
  const catchException = (response, promise) =>
    promise.catch(({ message: error = '' } = {}) => sendResponse(response, { code: 500, body: { error } }));
  const handleException = (error, request, response, next) =>
    error ? sendResponse(response, { code: 400, body: { error: error.message } }) : next();

  const express = require('express');
  const app = express();
  app.use(express.json(), handleException, require('cors')(), require('morgan')('combined'));

  /**
   * @ GET /api/contacts
   *
   * It calls listContacts()
   *
   * @return { code: 200, Contact[] } an array of all contacts.
   */
  app.get(API_CONTACTS, (request, response) =>
    catchException(
      response,
      listContacts().then(contacts => sendResponse(response, contacts))
    )
  );

  /**
   * @ GET /api/contacts/:contactId
   *
   * It calls getById()
   *
   * @param { Number } contactId
   *
   * @return { code: 200, Contact } if contactId exists
   * @return { code: 404, { "message": "Not found"} } if contactId does not exists
   */
  app.get(API_CONTACT_BY_ID, (request, response) =>
    catchException(
      response,
      getContactById(request.params[CONTACT_ID]).then(contact => sendResponse(response, contact))
    )
  );

  /**
   * @ POST /api/contacts
   *
   * It calls addContact()
   *
   * @param { Object } { name, email, phone, subscription, password, token }
   *
   * @return { code: 201, Contact } JSON with created contact
   * @return { code: 400, { "message": "missing required name field" } } if received data is invalid
   */
  app.post(API_CONTACTS, (request, response) =>
    catchException(
      response,
      addContact(request.body || {}).then(newContact => sendResponse(response, newContact))
    )
  );

  /**
   * @ DELETE /api/contacts/:contactId
   *
   * It calls removeContact()
   *
   * @param {Number} contactId
   *
   * @return { code: 200, { "message": "contact deleted" } } if contactId deleted
   * @return { code: 404, { "message": "Not found" } } if contactId does not exists
   */
  app.delete(API_CONTACT_BY_ID, (request, response) =>
    catchException(
      response,
      removeContact(request.params[CONTACT_ID]).then(result => sendResponse(response, result))
    )
  );

  /**
   * @ PATCH /api/contacts/:contactId
   *
   * Receives JSON with a new value for any fields
   *
   * @param { Object } { name?, email?, phone?, subscription?, password?, token? }
   *
   * @return { code: 200, Contact } JSON with updated contact
   * @return { code: 400, { "message": "missing fields" } } If the request body is invalid
   * @return { code: 404, { "message": "Not found" } } If such contact doesn't exist
   */
  app.patch(API_CONTACT_BY_ID, (request, response) =>
    catchException(
      response,
      updateContact(request.params[CONTACT_ID], request.body || {}).then(updatedContact =>
        sendResponse(response, updatedContact)
      )
    )
  );

  app.listen(PORT);

  console.log('Server start');
}
