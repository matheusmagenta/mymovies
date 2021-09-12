const express = require('express');
const router = express.Router();
const { getMovieByID, getMoviesByQuery} = require("../axiosData");
const { findOneAndDelete } = require('../models/movieAdded');
const MovieSchema = require('../models/movieAdded');
const bcrypt = require('bcrypt');
const passport = require('passport');

const storage = []; // for testing purposes
const users = []; // for testing purposes





// TODO: ADD TRY CATCH BLOCKS AND HANDLE ERRORS
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET movie by ID page. */
router.get('/movies/:id', async function(req, res, next) {
  const movieID = req.params.id
  // console.log('movieID: ', movieID)
  const movieDetails = await getMovieByID(req.params.id)
  // console.log('getID route:', movieDetails)

  // check if movie/review is on the DB
  const movieHasReview = await MovieSchema.findOne({ movieID: req.params.id })
  // console.log('movieHasReview:', movieHasReview)
  if(movieHasReview){
    res.render('movieDetails', { movieDetails, movieHasReview });
  } else {
    res.render('movieDetails', { movieDetails, movieHasReview: '' });
  }  
});

/* POST search by query. */
router.post('/search/:page', async function(req, res, next){
  // getting query search made by user
  const query = req.body['movie-search']
  console.log('query: ', query)

  console.log('req.params.page: ', req.params.page) 
  
  // getting results from API 
  const results = await getMoviesByQuery(query, req.params.page);
  // console.log('results', results)
      
  // rendering results
  res.render('results', { results, query });
})

/* POST adding movie with review to myMovies page. */
router.post('/add', async function(req, res, next){
  await saveToDatabase(req.body)

  res.redirect('/')
})

 /* GET movies of myMovies page. */
 router.get('/mymovies', checkAuthenticated, async function(req, res, next) {

  // retrieve IDs from DB
  const myMovies = await MovieSchema.find({})
  const arrayOfIDs = myMovies.map(movie => movie.movieID)

  // generate data to be render
  const myMoviesCollection = []
  for(let i = 0; i < arrayOfIDs.length; i++){
    let movie = await getMovieByID(arrayOfIDs[i])
    myMoviesCollection.push(movie)
    
  }
  
  // render the page with data retrieved
  res.render('myMovies', { myMoviesCollection });
});



/* POST/UPDATE movies of myMovies page. */
router.get('/movies/:id/edit', async function(req, res, next) {
  // console.log('req.params.id: ', req.params.id)

  // get movie from API and review from database 
  const movieDetails = await getMovieByID(req.params.id)
  const movieHasReview = await MovieSchema.findOne({ movieID: req.params.id })
  
  res.render('editReview', { movieDetails, movieHasReview });

});
router.post('/movies/:id/edit', async function(req, res, next) {
  console.log('req.params.id: ', req.params.id)

  // find and delete from database
  await MovieSchema.findOneAndDelete({ movieID: req.params.id })

  // adding review to database
  await saveToDatabase(req.body)

  res.redirect('/');
});

/* DELETE movies/reviews of myMovies page. */
router.delete('/movies/:id', async function(req, res, next) {
  // console.log('req.params.id: ', req.params.id)
  // console.log('movieID: ', movieID)
  await MovieSchema.findOneAndDelete({ movieID: req.params.id })
  res.redirect('/');
});

// FUNCTION adding review to database
async function saveToDatabase(movieAdded){
  // const movieAdded = await req.body
  // console.log('movieAdded: ', movieAdded)
  
  // adding to movie and review to database
  const movieToDB = new MovieSchema({
    movieID : movieAdded['movie-id-added'],
    movieReview: { 
    reviewTitle: movieAdded['review-title-added'],
    reviewDescription: movieAdded['review-description-added']
  }
  })
  await movieToDB.save();
}



// USER LOGIN, LOGOUT AND REGISTER HANDLING
/* GET register of users */
router.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register')
})

/* GET login of users */
router.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login')
})
 

/* POST register of users */
router.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log('hashedPassword: ', hashedPassword)
    users.push({
      // TODO: refactor to DB
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    console.log('users: ', users)
    res.redirect('/login')
  } catch {
    res.redirect('/')
  }
  console.log('checking if user was added: ', users)
})

/* POST login of users */
router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

/* DELETE logout of users */
router.delete('/logout', (req, res) => {
  req.logOut();
  res.redirect('/login')
})


// checking if user is authenticated or not
function checkAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return res.redirect('/');
  }
  next();
}


module.exports = {router, users};

