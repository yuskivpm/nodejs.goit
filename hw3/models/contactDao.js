const {
  Models: { Contacts },
  FIELDS,
} = require('../utils/dbUtils');

const MSG_NOT_FOUND = { code: 404, body: { message: 'Not found' } };
const MSG_MISSING_FIELDS = { code: 400, body: { message: 'missing fields' } };
const MSG_CONTACT_DELETED = { code: 200, body: { message: 'contact deleted' } };

const REQUIRED_FIELDS_COUNT = Object.keys(FIELDS).reduce((count, name) => (FIELDS[name].required ? ++count : count), 0);

/**
 * @ validateBody
 *
 * @param { Object } contact data as js object ({ name, email, phone, subscription, password, token })
 *
 * @return { Object({error, contact}) } "error" - list of absent fields, "contact" - list of existing fields.
 */
const validateBody = contactData =>
  Object.keys(FIELDS).reduce(
    ({ error, contact }, name) => {
      if (contactData.hasOwnProperty(name)) {
        contact[name] = contactData[name];
      } else if (FIELDS[name].required) {
        error.push(name);
      }
      return { error, contact };
    },
    { error: [], contact: {} }
  );

const prepareResponse = (body, code = 200) => (body ? { code, body } : MSG_NOT_FOUND);

/**
 * @ listContacts
 *
 * @return { code: 200, Contact[] } an array of all contacts.
 */
const listContacts = () => Contacts.find().then(prepareResponse);

/**
 * @ getContactById
 *
 * @param { Number } contactId
 *
 * @return { code: 200, Contact } if contactId exists
 * @return { code: 404, { "message": "Not found"} } if contactId does not exists
 */
const getContactById = contactId => Contacts.findById(contactId).then(prepareResponse);

/**
 * @ addContact
 *
 * @param { Object } contact data as js object ({ name, email, phone, subscription, password, token })
 *
 * @return { code: 201, Contact } JSON with created contact
 * @return { code: 400, { "message": "missing required name field" } } if received data is invalid
 */
const addContact = async newContact => {
  const { error, contact } = validateBody(newContact);
  return error.length
    ? prepareResponse({ message: `missing required ${error} field${error.length > 1 ? 's' : ''}` }, 400)
    : Contacts.create(contact).then(body => prepareResponse(body, 201));
};

/**
 * @ removeContact
 *
 * @param { Number } contactId
 *
 * @return { code: 200, { "message": "contact deleted" } } if contactId deleted
 * @return { code: 404, { "message": "Not found" } } if contactId does not exists
 */
const removeContact = async contactId =>
  Contacts.findByIdAndRemove(contactId).then(removedContact => (removedContact ? MSG_CONTACT_DELETED : MSG_NOT_FOUND));

/**
 * @ updateContact
 *
 * Receives JSON with a new value for any fields
 *
 * @param { Object } contact data as js object ({ name?, email?, phone?, subscription?, password?, token? })
 *
 * @return { code: 200, Contact } JSON with updated contact
 * @return { code: 400, { "message": "missing fields" } } If the request body is invalid
 * @return { code: 404, { "message": "Not found" } } If such contact doesn't exist
 */
const updateContact = async (contactId, updateContact) => {
  const { error, contact } = validateBody(updateContact);
  return error.length === REQUIRED_FIELDS_COUNT
    ? MSG_MISSING_FIELDS
    : Contacts.findByIdAndUpdate(contactId, contact, {
        runValidators: true,
        new: true,
      }).then(prepareResponse);
};

module.exports = { listContacts, getContactById, addContact, removeContact, updateContact };
