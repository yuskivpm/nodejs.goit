const argv = require('yargs').argv;

const { listContacts, getContactById, addContact, removeContact, updateContact } = require('./contacts');

const handlers = {
  list: listContacts,
  get: ({ id }) => getContactById(id),
  add: ({ name, email, phone }) => addContact(name, email, phone),
  remove: ({ id }) => removeContact(id).then(() => 'Item removed'),
  update: ({ id, contact }) => updateContact(id, JSON.parse(contact)),
};

const invokeAction = ({ action, ...args }) =>
  handlers[action]
    ? handlers[action](args).then(data => console.table(data || '')).catch(err => console.warn(err))
    : startServer();

invokeAction(argv);

function startServer() {
  const PORT = 3000;
  const FIELD_NAMES = ['name', 'email', 'phone'];

  const MSG_NOT_FOUND = { message: 'Not found' };
  const MSG_CONTACT_DELETED = { message: 'contact deleted' };
  const MSG_MISSING_FIELDS = { message: 'missing fields' };

  const CONTACT_ID = 'contactId';
  const API_CONTACTS = '/api/contacts';
  const API_CONTACT_BY_ID = `${API_CONTACTS}/:${CONTACT_ID}`;

  const response_any = (response, message, code = 200) => response.status(code).send(message);
  const response_404 = response => response_any(response, MSG_NOT_FOUND, 404);
  const response_500 = (error, response) => response_any(response, { error }, 500);
  const catchException = (response, promise) => promise.catch(err => response_500(err, response));

  function validateBody({ body = {} } = {}) {
    const error = [];
    const contact = {};
    fields = FIELD_NAMES.map(name => (body[name] ? (contact[name] = body[name]) : error.push(name)));
    return { error, fields, contact };
  }

  const express = require('express');
  const app = express();

  app.use(
    express.json(),
    require('cors')(),
    require('morgan')('combined')
  );

  /* @ GET /api/contacts
  Call listContacts().
  Returns the code 200 and JSON with an array of all contacts.
  */
  app.get(API_CONTACTS, (request, response) =>
    catchException(
      response,
      listContacts().then(contacts => response_any(response, contacts))
    )
  );

  /* @ GET /api/contacts/:contactId
  Receives contactId.
  Calls getById().
  If contactId exists it returns the code 200 and JSON with contact.
  Else it returns the code 404 and JSON {"message": "Not found"}
  */
  app.get(API_CONTACT_BY_ID, (request, response) =>
    catchException(
      response,
      getContactById(request.params[CONTACT_ID]).then(contact =>
        contact ? response_any(response, contact) : response_404(response)
      )
    )
  );

  /* @ POST /api/contacts
  Receives body with JSON { name, email, phone }.
  If received data is invalid it returns the code 400 with JSON {"message": "missing required name field"}.
  Else it calls addContact(), returns the code 201 and JSON with created contact.
  */
  app.post(API_CONTACTS, (request, response) => {
    const { error, fields } = validateBody(request);
    if (error.length) {
      return response_any(response, { message: `missing required ${error} field${error.length > 1 ? 's' : ''}` }, 400);
    }
    catchException(
      response,
      addContact(...fields).then(newContact => response_any(response, newContact, 201))
    );
  });

  /* @ DELETE /api/contacts/:contactId
  Receives contactId.
  Calls removeContact().
  If contactId exists, it returns the code 200 and JSON {"message": "contact deleted"}.
  Else it returns the code 404 and JSON {"message": "Not found"}
  */
  app.delete(API_CONTACT_BY_ID, (request, response) =>
    catchException(
      response,
      removeContact(request.params[CONTACT_ID]).then(result =>
        result ? response_any(response, MSG_CONTACT_DELETED) : response_404(response)
      )
    )
  );

  /* @ PATCH /api/contacts/:contactId
  Receives JSON with a new value for any fields (name, email, phone).
  If the request body is invalid it returns the code 400 and JSON {"message": "missing fields"}.
  If such contact doesn't exist it returns the code 404 and JSON {"message": "Not found"}.
  Else it calls updateContact(id) function, returns the code 200 and JSON with updated contact.
  */
  app.patch(API_CONTACT_BY_ID, (request, response) => {
    const { error, contact } = validateBody(request);
    if (error.length === FIELD_NAMES.length) {
      return response_any(response, MSG_MISSING_FIELDS, 400);
    }
    catchException(
      response,
      updateContact(request.params[CONTACT_ID], contact).then(updatedContact =>
        updatedContact ? response_any(response, updatedContact) : response_404(response)
      )
    );
  });

  app.listen(PORT);

  console.log('Server start');
}
