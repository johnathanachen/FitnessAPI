const express = require('express');
const User = require('./user.model.js');
const auth = require('../../config/auth');

const router = express.Router(); // eslint-disable-line new-cap

router.get('/', auth.optional, (req, res) => {
  res.json({ welcome: 'user' });
});

router.get('/current', auth.required, (req, res) => {
  res.json({ authorized: 'content' });
});

router.post('/signup', auth.optional, (req, res) => {
  // create a sample user
  const newUser = new User({
    username: req.query.username,
    password: req.query.password,
    admin: false
  });

  newUser.save((err) => {
    if (err) throw err;
    res.json({ success: 'User saved successfully' });
  });
});

router.post('/login', auth.optional, (req, res) => {
  User.findOne({
    username: req.body.username || req.query.username
  }, (err, user) => {
    if (err) throw err;
    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {
     // check if password matches
      if (user.password !== (req.body.password || req.query.password)) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {
        const token = user.generateJWT();
       // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your API token!',
          token
        });
      }
    }
  });
});

router.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(err.status).send({ 'Try these': { Login: '/api/v1/users/login', Signup: '/api/v1/users/signup' } });
    return;
  }
  next();
});

module.exports = router;
