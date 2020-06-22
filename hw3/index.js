const { handleError } = require('./utils/utils');
const { connectToDb } = require('./utils/dbUtils');

connectToDb(handleError).then(error => {
  if (error) {
    process.exit(handleError(error) || 1);
  } else {
    const parseCommandLine = require('./controllers/argParser');
    const startServer = require('./controllers/server');
    parseCommandLine() || startServer();
  }
});
