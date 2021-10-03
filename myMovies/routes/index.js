const express = require('express');
const router = express.Router();
const { getMovieByID, getMoviesByQuery, getRecommendationByID, getStreamingByID, getTrendingMoviesWeek} = require("../axiosData");
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


  // retrieve movies from database
  const whereToWatch = await getStreamingByID(movieID)
  console.log('whereToWatch: ', whereToWatch)

  // check if movie/review is on the DB
  const movieHasReview = await MovieSchema.findOne({ movieID: req.params.id })
  // console.log('movieHasReview:', movieHasReview)
  if(movieHasReview){
    res.render('movieDetails', { movieDetails, whereToWatch, movieHasReview });
  } else {
    res.render('movieDetails', { movieDetails, whereToWatch, movieHasReview: '' });
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

  // retrieve movies from database
  const myMovies = await getListFromDatabase()
  // console.log('myMoviesWatchlist: ', myMovies[0])
  // console.log('myMoviesReviewed: ', myMovies[1])

  // render the page with data retrieved
  res.render('myMovies', { myMoviesWatchlist: myMovies[0], myMoviesReviewed: myMovies[1] });
  
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

  res.redirect('/mymovies');
});

/* DELETE movies/reviews of myMovies page. */
router.delete('/movies/:id', async function(req, res, next) {
  // console.log('req.params.id: ', req.params.id)
  // console.log('movieID: ', movieID)
  await MovieSchema.findOneAndDelete({ movieID: req.params.id })
  res.redirect('/mymovies');
});

/* POST adding movie to watchlist section on myMovies page. */
router.post('/add-to-watchlist', async function(req, res, next){
  console.log('req.body: ', req.body)
  await saveToWatchlist(req.body)

  res.redirect('/')
})

// FUNCTION adding review to database
async function saveToDatabase(movieAdded){
  // const movieAdded = await req.body
  // console.log('movieAdded: ', movieAdded)
  
  // adding to movie and review to database
  const movieToDB = new MovieSchema({
    movieID : movieAdded['movie-id-added'],
    movieTitle: movieAdded['movie-title-added'],
    movieWatchlist: false,
    movieRecommendations: await getRecommendationByID(movieAdded['movie-id-added']),
    movieReview: { 
    reviewTitle: movieAdded['review-title-added'],
    reviewDescription: movieAdded['review-description-added']
  }
  })
  console.log('movieToDB: ', movieToDB)
  await movieToDB.save();
}



// FUNCTION adding movie to watchlist
async function saveToWatchlist(movieAdded){
  // const test = await req.body
  console.log('movieAdded: ', movieAdded)
  
  // adding to movie and review to database
  const movieToWatchlist = new MovieSchema({
    movieID : movieAdded['movie-id-added'],
    movieTitle: movieAdded['movie-title-added'],
    movieWatchlist: movieAdded['movie-to-watchlist']
  })
  console.log('movieToWatchlist: ', movieToWatchlist)
  await movieToWatchlist.save();
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

/* GET recommendations based on mymovies list */
router.get('/recommendations', checkAuthenticated, async (req, res) => {

  // retrieve movies from database
  const myMoviesCollection = await MovieSchema.find({})
  const myMovies = myMoviesCollection.filter(movie => movie.movieWatchlist == false)
  
  console.log('myMovies: ', myMovies )


  res.render('recommendations', { myMovies } )
})

/* GET trending movies this week */
router.get('/trending', async (req, res) => {

  // retrieve movies from database
  const trendingMovies = await getTrendingMoviesWeek()
  console.log('trendingMovies: ', trendingMovies)


  res.render('trending', { trendingMovies } )
})

/* GET streaming platforms for each movie */
router.get('/streaming', async (req, res) => {

  // retrieve movies from database
  const whereToWatch = await getStreamingByID(550)
  console.log('whereToWatch: ', whereToWatch)

  res.redirect('/')
  // res.render('streaming', { whereToWatch } )
})


// FUNCTIONS
// checking if user is authenticated or not
function checkAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/register');
}

function checkNotAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return res.redirect('/');
  }
  next();
}

// getting mymovies list from database
async function getListFromDatabase(req, res, next){
  // retrieve IDs from DB
  const myMovies = await MovieSchema.find({})
  //console.log('myMovies: ', myMovies)

  const arraysOfIDsWatchlist = myMovies.filter(movie => movie.movieWatchlist == true).map(movie => movie = movie.movieID)
  const arraysOfIDsReviewed = myMovies.filter(movie => movie.movieWatchlist == false).map(movie => movie = movie.movieID)

    // generate data to be render
  const myMoviesWatchlist = []
  for(let i = 0; i < arraysOfIDsWatchlist.length; i++){
    let movie = await getMovieByID(arraysOfIDsWatchlist[i])
    myMoviesWatchlist.push(movie)
    
  }
  const myMoviesReviewed = []
  for(let i = 0; i < arraysOfIDsReviewed.length; i++){
    let movie = await getMovieByID(arraysOfIDsReviewed[i])
    myMoviesReviewed.push(movie)
    
  }
  return [myMoviesWatchlist, myMoviesReviewed]
}



module.exports = {router, users};

