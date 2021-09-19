require('dotenv').config()

const axios = require('axios');

const API_KEY = process.env.API_KEY
const MovieSchema = require('./models/movieAdded');

// example of api request with my api_key
// https://api.themoviedb.org/3/movie/550?api_key=21545d3f8c898a2b27bafd3db0854b12

function getMovieByID(movieID){
    return axios
    .get(`https://api.themoviedb.org/3/movie/${movieID}`, { params: { api_key: API_KEY }
        })
    .then(res => res.data)
    .catch(err => console.error(err))
}
// getMovieByID(550);

function getMoviesByQuery(movieQuery, pagination = 1){
    return axios
    .get('https://api.themoviedb.org/3/search/movie', { params : 
        {
            api_key: API_KEY,
            query: movieQuery,
            page: pagination
        }
    })
    .then(res => res.data)
    .catch(err => console.error(err))
}
// getMoviesByQuery('fight')

async function getRecommendationByID(movieID){
   
    // returning data of recommendations of each movie of myMovies list, adding ID and Title from original movie 
    return axios
        .get(`https://api.themoviedb.org/3/movie/${movieID}/recommendations`, { params: { api_key: API_KEY }
            })
        .then(res => {
            const arrayRecommendations = [];
            arrayRecommendations.push({id: res.data.results[0].id, original_title: res.data.results[0].original_title, poster_path: res.data.results[0].poster_path})
            arrayRecommendations.push({id: res.data.results[1].id, original_title: res.data.results[1].original_title, poster_path: res.data.results[1].poster_path})
            arrayRecommendations.push({id: res.data.results[2].id, original_title: res.data.results[2].original_title, poster_path: res.data.results[2].poster_path})
            
            console.log('arrayRecommendations: ', arrayRecommendations)
            return arrayRecommendations
        })
        .catch(err => console.error(err))
              
}
// getMovieByID(550);

module.exports = { getMovieByID, getMoviesByQuery, getRecommendationByID } 