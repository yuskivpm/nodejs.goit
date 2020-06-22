/**
 * @ handleError
 *
 * Default error handler function - console.error
 *
 * @param { { message: String } } object with message string
 */
const handleError = ({ message = '' } = {}) => console.error('DB ERROR: ', message);

/**
 * @ sendResponse
 *
 * send data to client
 *
 * @param { Response, { code: Number, body: String } } - response object, status code, message body
 */
const sendResponse = (response, { code = 200, body = '' }) => response.status(code).send(body);

/**
 * @ catchException
 *
 * Catch unhandled promise exceptions.
 * Send response: { code: 500, body: { error } }
 *
 * @param { Response, Promise }
 */
const catchException = (response, promise) =>
  promise.catch(({ message: error = '' } = {}) => sendResponse(response, { code: 500, body: { error } }));

/**
 * @ handleException
 *
 * Express middleware.
 * Handle JSON-parsing exception throwed by express.json() middleware.
 *
 * @param { Error, Request, Response, Function }
 */
const handleException = (error, request, response, next) =>
  error ? sendResponse(response, { code: 400, body: { error: error.message } }) : next();

module.exports = { handleError, sendResponse, catchException, handleException };
