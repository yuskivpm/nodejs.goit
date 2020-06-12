require('dotenv').config();
const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;

const validateEmail = value => value.includes('@');

const MONGOOSE_OPTIONS = { useNewUrlParser: true, useUnifiedTopology: true };
const DEFAULT_TYPE = { type: String, required: true };
const FIELDS = {
  name: DEFAULT_TYPE,
  email: { ...DEFAULT_TYPE, validate: validateEmail },
  phone: DEFAULT_TYPE,
  subscription: DEFAULT_TYPE,
  password: DEFAULT_TYPE,
  token: String,
};
const REQUIRED_FIELDS_COUNT = Object.keys(FIELDS).reduce((count, name) => (FIELDS[name].required ? ++count : count), 0);

const MSG_NOT_FOUND = { code: 404, body: { message: 'Not found' } };
const MSG_MISSING_FIELDS = { code: 400, body: { message: 'missing fields' } };
const MSG_CONTACT_DELETED = { code: 200, body: { message: 'contact deleted' } };

let ContactModel;

// helpers
async function connectToDb(handleError) {
  try {
    await mongoose.connect(process.env.DB_HOST, MONGOOSE_OPTIONS);
    mongoose.connection.on('error', handleError);
    ContactModel = mongoose.model('contacts', new mongoose.Schema(FIELDS));
    return null;
  } catch (err) {
    return err;
  }
}

const closeDb = () => mongoose.connection.close();

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

const getIdObject = contactId => ({ _id: ObjectID(`${contactId}`) });

// get all contacts
const listContacts = () => ContactModel.find({}).then(body => ({ code: 200, body }));

// get contact by id
const getContactById = contactId =>
  ContactModel.findById(contactId).then(body => (body ? { code: 200, body } : MSG_NOT_FOUND));

// add new contact
const addContact = async newContact => {
  const { error, contact } = validateBody(newContact);
  return error.length
    ? { code: 400, body: { message: `missing required ${error} field${error.length > 1 ? 's' : ''}` } }
    : ContactModel.create(contact).then(body => ({ code: 201, body }));
};

// delete contact by id
const removeContact = async contactId =>
  ContactModel.deleteOne(getIdObject(contactId)).then(({ deletedCount }) =>
    deletedCount ? MSG_CONTACT_DELETED : MSG_NOT_FOUND
  );

// update existing contact
const updateContact = async (contactId, updateContact) => {
  const { error, contact } = validateBody(updateContact);
  return error.length === REQUIRED_FIELDS_COUNT
    ? MSG_MISSING_FIELDS
    : ContactModel.updateOne(getIdObject(contactId), contact, { runValidators: true }).then(data =>
        data.nModified ? getContactById(contactId) : MSG_NOT_FOUND
      );
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  connectToDb,
  closeDb,
};
