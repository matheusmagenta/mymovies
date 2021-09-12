require('dotenv').config()

const axios = require('axios');

const API_KEY = process.env.API_KEY

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

module.exports = { getMovieByID, getMoviesByQuery } 