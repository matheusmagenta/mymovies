const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    movieID: {
        type: String
    },
    movieTitle: {
        type: String
    },
    movieRecommendations: {
        type: Array
    },
    movieWatchlist: {
        type: Boolean
    },
    movieReview: {
        reviewTitle: {
            type: String
        },
        reviewDescription: {
            type: String
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        author: {
            type: String,
            default: 'john doe'
        } 
    }
})


module.exports = mongoose.model('MovieSchema', movieSchema)