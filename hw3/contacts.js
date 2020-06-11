require('dotenv').config();
const mongoose = require('mongoose');
let ContactModel;

function connectToDb(callback) {
  const DEF_TYPE = { type: String, required: true };
  mongoose.connect(process.env.DB_HOST, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      const db = mongoose.connection;
      db.on('error', err => console.error('Connection error: ', err));
      console.log('Database connection successful');
      const contactSchema = new mongoose.Schema({
        name: DEF_TYPE,
        email: { ...DEF_TYPE, validate: value => value.includes('@') },
        phone: DEF_TYPE,
        subscription: DEF_TYPE,
        password: DEF_TYPE,
        token: String
      });
      ContactModel = mongoose.model('contacts', contactSchema);
      callback();
    })
    .catch(err => {
      console.error('Fail connect to db: ', err);
      process.exit(1);
    });
}

// helpers
// const getIndexById = (contacts, contactId) => contacts.findIndex(({ id }) => id == contactId);

const listContacts = () => new Promise((resolve, reject) =>
  ContactModel.find({}, (err, data) => err ? reject(err) : resolve(data.map(doc => doc._doc)))
);

// get all contacts
const getContactById = contactId => new Promise((resolve, reject) =>
  ContactModel.findById(contactId, (err, data) => err ? reject(err) : resolve(data))
);

// get contact by id
async function removeContact(contactId) {
  const contacts = await listContacts();
  const contactIndex = getIndexById(contacts, contactId);
  const result = contactIndex >= 0;
  if (result) {
    await fs.promises.writeFile(contactPath, prepareData(contacts.filter((value, index) => index !== contactIndex)));
  }
  return result;
}

// add new contact
async function addContact(name, email, phone) {
  let newItem;
  const contacts = await listContacts();
  await fs.promises.writeFile(
    contactPath,
    prepareData(contacts.concat((newItem = { id: getMaxId(contacts), name, email, phone })))
  );
  return newItem;
}

// update existing contact
async function updateContact(contactId, update) {
  let resultContact;
  const contacts = await listContacts();
  const contactIndex = getIndexById(contacts, contactId);
  if (contactIndex >= 0) {
    resultContact = Object.assign(contacts[contactIndex], update);
    await fs.promises.writeFile(contactPath, prepareData(contacts));
  }
  return resultContact;
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  connectToDb,
};
