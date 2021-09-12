const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const users = []; // for testing purposes
const passport = require('passport')




// USER LOGIN, LOGOUT AND REGISTER HANDLING
/* GET register of users */
router.get('/register', (req, res) => {
  res.render('register')
})

/* GET login of users */
router.get('/login', (req, res) => {
  res.render('login')
})
 

/* POST register of users */
router.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      // TODO: refactor to DB
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } catch {
    res.redirect('/')
  }
  console.log('checking if user was added: ', users)
})

/* POST login of users */
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

/* DELETE logout of users */
router.delete('/logout', (req, res) => {
  
})

module.exports = router;
