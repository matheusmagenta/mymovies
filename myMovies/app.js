if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const axios = require('axios');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const app = express();
const { users, router: indexRouter } = require('./routes/index')


// initialize and setup passport
const passport = require('passport')
const initializePassport = require('./passport-config')
const flash = require('express-flash')
const session = require('express-session')
initializePassport(passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false, // don't resave session if nothing has changed
  saveUninitialized: false // don't save empty values
}))
app.use(passport.initialize())
app.use(passport.session())








// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use('/', indexRouter);
// app.use('/users', usersRouter);


// login, authenticate setup



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// database setup
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log('connected to database'));
// error handler in database
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
