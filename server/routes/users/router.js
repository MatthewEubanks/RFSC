const express = require('express');
const bodyParser = require('body-parser');

const { User } = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();

// get the reviewer //
app.get('/getReviewer', (req, res) => {
  let id = req.query.id;

  User.findById(id)
    .then(doc =>
      res.json({
        name: doc.name,
        lastname: doc.lastname,
      })
    )
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: 'something went really wrong' });
    });
});

// get all users //
app.get('/users', (req, res) => {
  User.find(req.params.id)
    .then(users => res.status(200).send(users))
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: 'something went really wrong' });
    });
});

// Post to creat a new user
router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['name', 'lastname', 'email', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField,
    });
  }

  const stringFields = ['email', 'password', 'name', 'lastname'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField,
    });
  }

  // Trimming to avoid errors.
  const explicityTrimmedFields = ['email', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField,
    });
  }

  const sizedFields = {
    username: {
      min: 1,
    },
    password: {
      min: 8,
      // bcrypt truncates after 72 characters,
      max: 72,
    },
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
      req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
      req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
        : `Must be at most ${sizedFields[tooLargeField].max} characters long`,
      location: tooSmallField || tooLargeField,
    });
  }

  let { email, password, name = '', lastname = '' } = req.body;
  // Username and password are trimmed, otherwise we throw an error
  firstName = firstName.trim();
  lastName = lastName.trim();

  return User.find({ email })
    .count()
    .then(count => {
      if (count > 0) {
        // user with same username
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username',
        });
      }
      return User.hashPassword(password);
    })
    .then(hash => {
      return User.create({
        email,
        password: hash,
        name,
        lastname,
      });
    })
    .then(user => {
      return res.status(201).json(user.serialize());
    })
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({ code: 500, message: 'Internal server error' });
    });
});

router.get('/', (req, res) => {
  return User.find()
    .then(users => res.json(users.map(user => user.serialize())))
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

app.post('/register', jsonParser, (req, res) => {
  const user = new User(req.body);

  user.save((err, doc) => {
    if (err) return res.json({ success: false });
    res.status(200).json({
      success: true,
      user: doc,
    });
  });
});

module.exports = { router };
