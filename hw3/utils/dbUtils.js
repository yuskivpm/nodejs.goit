require('dotenv').config();
const mongoose = require('mongoose');

const MONGOOSE_OPTIONS = { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };

const validateEmail = value => value.includes('@');
const DEFAULT_TYPE = { type: String, required: true };
const FIELDS = {
  name: DEFAULT_TYPE,
  email: { ...DEFAULT_TYPE, validate: validateEmail },
  phone: DEFAULT_TYPE,
  subscription: { ...DEFAULT_TYPE, enum: ['free', 'pro', 'premium'] },
  password: { ...DEFAULT_TYPE, default: 'password' },
  token: { type: String, default: '' },
};

let Models = {};

/**
 * @ connectToDb
 *
 * Open DB connection
 *
 * @param { handleError: Function } function for error handling
 *
 * @return { Error }
 */
async function connectToDb(handleError) {
  try {
    await mongoose.connect(process.env.DB_HOST, MONGOOSE_OPTIONS);
    mongoose.connection.on('error', handleError);
    Models.Contacts = mongoose.model('contacts', new mongoose.Schema(FIELDS));
    return null;
  } catch (err) {
    return err;
  }
}

/**
 * @ closeDb
 *
 * Close DB connection
 */
const closeDb = () => mongoose.connection.close();

module.exports = { Models, connectToDb, closeDb, FIELDS };
