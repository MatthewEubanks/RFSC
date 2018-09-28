const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const config = require('../../config/config');
const router = express.Router();

const createAuthToken = function(user) {
  return jwt.sign({ user }, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256',
  });
};

const localAuth = passport.authenticate('local', { session: false });
router.use(bodyParser.json());

// user login //
app.post('/login', localAuth, (req, res) => {
  const authToken = createAuthToken(req.user.serialize());
  res.json({ authToken });
  // User.findOne({ email: req.body.email }, (err, user) => {
  //   if (!user)
  //     return res.json({
  //       isAuth: false,
  //       message: 'Auth failed email not found',
  //     });

  //   user.comparePassword(req.body.password, (err, isMatch) => {
  //     if (!isMatch)
  //       return res.json({
  //         isAuth: false,
  //         message: 'Wrong password',
  //       });

  //     user.generateToken((err, user) => {
  //       if (err) return res.status(400).send(err);
  //       res.cookie('auth', user.token).json({
  //         isAuth: true,
  //         id: user._id,
  //         email: user.email,
  //       });
  //     });
  //   });
  // });
});

router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
});

// log user out //
router.get('/logout', auth, (req, res) => {
  req.user.deleteToken(req.token, (err, user) => {
    if (err) return res.status(400).send(err);
    res.sendStatus(200);
  });
});

module.exports = { router };
