const contactsRouter = require('express').Router();

const { listContacts, getContactById, addContact, removeContact, updateContact } = require('../../models/contactDao');
const { catchException, sendResponse } = require('../../utils/utils');

const CONTACT_ID = 'contactId';
const API_CONTACTS = '/';
const API_CONTACT_BY_ID = `${API_CONTACTS}:${CONTACT_ID}`;

/**
 * @ GET /api/contacts
 *
 * It calls listContacts()
 *
 * @return { code: 200, Contact[] } an array of all contacts.
 */
contactsRouter.get(API_CONTACTS, (request, response) =>
  catchException(
    response,
    listContacts().then(contacts => sendResponse(response, contacts))
  )
);

/**
 * @ GET /api/contacts/:contactId
 *
 * It calls getContactById()
 *
 * @param { Number } contactId
 *
 * @return { code: 200, Contact } if contactId exists
 * @return { code: 404, { "message": "Not found"} } if contactId does not exists
 */
contactsRouter.get(API_CONTACT_BY_ID, (request, response) =>
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
 * @param { Object } contact data as js object ({ name, email, phone, subscription, password, token })
 *
 * @return { code: 201, Contact } JSON with created contact
 * @return { code: 400, { "message": "missing required name field" } } if received data is invalid
 */
contactsRouter.post(API_CONTACTS, (request, response) =>
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
 * @param { Number } contactId
 *
 * @return { code: 200, { "message": "contact deleted" } } if contactId deleted
 * @return { code: 404, { "message": "Not found" } } if contactId does not exists
 */
contactsRouter.delete(API_CONTACT_BY_ID, (request, response) =>
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
 * @param { Object } contact data as js object ({ name?, email?, phone?, subscription?, password?, token? })
 *
 * @return { code: 200, Contact } JSON with updated contact
 * @return { code: 400, { "message": "missing fields" } } If the request body is invalid
 * @return { code: 404, { "message": "Not found" } } If such contact doesn't exist
 */
contactsRouter.patch(API_CONTACT_BY_ID, (request, response) =>
  catchException(
    response,
    updateContact(request.params[CONTACT_ID], request.body || {}).then(updatedContact =>
      sendResponse(response, updatedContact)
    )
  )
);

module.exports = contactsRouter;
