const argv = require('yargs').argv;

const { listContacts, getContactById, addContact, removeContact, updateContact } = require('./contacts');

invokeAction(argv);

function invokeAction({ action, id, name, email, phone }) {
  let logThis
  switch (action) {
    case 'list':
      logThis = listContacts()
      break

    case 'get':
      logThis = getContactById(id)
      break

    case 'add':
      logThis = addContact(name, email, phone)
      break

    case 'remove':
      logThis = removeContact(id).then(() => 'Item removed')
      break

    default:
      return startServer();
      
  }
  logThis.then(data => console.table(data || '')).catch(err => console.warn(err))
}

function startServer(){
  
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

  function validateBody({ body = {} } = {}) {
    const error = [];
    const contact = {};
    fields = FIELD_NAMES.map(name => body[name] ? contact[name] = body[name] : error.push(name));
    return { error, fields, contact };
  }

  const catchExeption = (response, promise) => promise.catch(err => response_500(err, response));
  
  const express = require('express');
  const app = express();

  app.use(express.json());
  app.use(require('cors')());
  app.use(require('morgan')('combined'));

  /*
  @ GET /api/contacts
  ничего не получает
  вызывает функцию listContacts для работы с json-файлом contacts.json
  возвращает массив всех контактов в json-формате со статусом 200
  */
  app.get(API_CONTACTS, (request, response) =>
    catchExeption(response, 
      listContacts().then(contacts => 
        response_any(response, contacts)
      )
    )
  );

  /*
  @ GET /api/contacts/:contactId
  Не получает body
  Получает параметр contactId
  вызывает функцию getById для работы с json-файлом contacts.json
  если такой id есть, возвращает обьект контакта в json-формате со статусом 200
  если такого id нет, возвращает json с ключом "message": "Not found" и статусом 404
  */
  app.get(API_CONTACT_BY_ID, (request, response) =>
    catchExeption(response, 
      getContactById(request.params[CONTACT_ID]).then(contact => 
        contact ? response_any(response, contact) : response_404(response)
      )
    )
  );

  /*
  @ POST /api/contacts
  Получает body в формате {name, email, phone}
  Если в body нет каких-то обязательных полей, возарщает json с ключом {"message": "missing required name field"} и статусом 400
  Если с body все хорошо, добавляет уникальный идентификатор в обьект контакта
  Вызывает функцию addContact() для сохранения контакта в файле contacts.json
  По результату работы функции возвращает обьект с добавленным id {id, name, email, phone} и статусом 201
  */
  app.post(API_CONTACTS, (request, response) => {
    const { error, fields } = validateBody(request);
    if (error.length) {
      return response_any(response, { message: `missing required ${error} field${error.length > 1 ? 's' : ''}` }, 400);
    }
    catchExeption(response, 
      addContact(...fields).then(newContact => 
        response_any(response, newContact, 201)
      )
    );
  });

  /*
  @ DELETE /api/contacts/:contactId
  Не получает body
  Получает параметр contactId
  вызывает функцию removeContact для работы с json-файлом contacts.json
  если такой id есть, возвращает json формата {"message": "contact deleted"} и статусом 200
  если такого id нет, возвращает json с ключом "message": "Not found" и статусом 404
  */
  app.delete(API_CONTACT_BY_ID, (request, response) =>
    catchExeption(response, 
      removeContact(request.params[CONTACT_ID]).then(result => 
        (result ? response_any(response, MSG_CONTACT_DELETED) : response_404(response))
      )
    )
  );

  /*
  @ PATCH /api/contacts/:contactId
  Получает body в json-формате c обновлением любых полей name, email и phone
  Если body нет, возарщает json с ключом {"message": "missing fields"} и статусом 400
  Если с body все хорошо, вызывает функцию updateContact(id) (напиши ее) для обновления контакта в файле contacts.json
  По результату работы функции возвращает обновленный обьект контакта и статусом 200. В противном случае, возвращает json с ключом "message": "Not found" и статусом 404
  */
  app.patch(API_CONTACT_BY_ID, (request, response) => {
    const { error, contact } = validateBody(request);
    if (error.length === FIELD_NAMES.length) {
      return response_any(response, MSG_MISSING_FIELDS, 400);
    }
    catchExeption(response, updateContact(request.params[CONTACT_ID], contact)
      .then(updatedContact => 
        updatedContact ? response_any(response, updatedContact) : response_404(response)
      )
    );
  });

  app.listen(PORT);

  console.log('Server start');
}
