const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const config = require('./config/config').get(process.env.NODE_ENV);
const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(config.DATABASE);

const { User } = require('./models/user');
const { Book } = require('./models/book');
const { auth } = require('./middleware/auth');

const jsonParser = bodyParser.json();

app.use(bodyParser.json());
app.use(cookieParser());

// GET //
app.get('/api/auth', auth, (req, res) => {
  res.json({
    isAuth: true,
    id: req.user._id,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
  });
});

// log user out //
app.get('/api/logout', auth, (req, res) => {
  req.user.deleteToken(req.token, (err, user) => {
    if (err) return res.status(400).send(err);
    res.sendStatus(200);
  });
});

// get all books //
app.get('/api/books', (req, res) => {
  // localhost:3001/api/books?skip=3&limit=2&order=asc
  let skip = parseInt(req.query.skip);
  let limit = parseInt(req.query.limit);
  let order = req.query.order;

  // ORDER = asc || desc
  Book.find()
    .skip(skip)
    .sort({ _id: order })
    .limit(limit)
    .exec((err, doc) => {
      if (err) return res.status(400).send(err);
      res.send(doc);
    });
});
// get single book by id //
app.get('/api/getBook', (req, res) => {
  Book.findById(req.query.id)
    .then(book => res.json(book))
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: 'something went really wrong' });
    });
});

// get the reviewer //
app.get('/api/getReviewer', (req, res) => {
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
app.get('/api/users', (req, res) => {
  User.find(req.params.id)
    .then(users => res.status(200).send(users))
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: 'something went really wrong' });
    });
});

// get all user posts //
app.get('/api/user_posts', (req, res) => {
  Book.find({ ownerId: req.query.user })
    .then(docs => res.send(docs))
    .catch(err => {
      console.log(err);
      res.status(400).send(err);
    });
  // .exec((err, docs) => {
  //   if (err) return res.status(400).send(err);
  //   res.send(docs);
  // });
});

// POST //
// book post //
app.post('/api/books', (req, res) => {
  const book = new Book(req.body);

  book.save((err, doc) => {
    if (err) return res.status(400).send(err);
    res.status(200).json({
      post: true,
      bookId: doc._id,
    });
  });
});

// user post //
app.post('/api/register', jsonParser, (req, res) => {
  const user = new User(req.body);

  user.save((err, doc) => {
    if (err) return res.json({ success: false });
    res.status(200).json({
      success: true,
      user: doc,
    });
  });
});

// user login //
app.post('/api/login', (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user)
      return res.json({
        isAuth: false,
        message: 'Auth failed email not found',
      });

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          isAuth: false,
          message: 'Wrong password',
        });

      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        res.cookie('auth', user.token).json({
          isAuth: true,
          id: user._id,
          email: user.email,
        });
      });
    });
  });
});

// UPDATE //
app.post('/api/book_update', (req, res) => {
  // if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
  //   res.status(400).json({
  //     error: 'Request path id and request body id values must match',
  //   });
  // }
  // const updated = {};
  // const updateableFields = ['name', 'author', ''];

  // updateableFields.forEach(field => {
  //   if (field in req.body) {
  //     updated[field] = req.body[field];
  //   }
  // });
  Book.findByIdAndUpdate(req.body._id, req.body, { new: true }, (err, doc) => {
    if (err) return res.status(400).send(err);
    res.json({
      success: true,
      doc,
    });
  });
});

// DELETE //
app.delete('/api/books/:id', (req, res) => {
  Book.findByIdAndRemove(req.query.id).then(() => {
    console.log(`Deleted book with id \`${req.query.id}\``);
    res.status(204).end();
  });
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log('server running');
});
