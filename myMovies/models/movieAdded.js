const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    movieID: {
        type: String
    },
    movieReview: {
        reviewTitle: {
            type: String,
            required: true
        },
        reviewDescription: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        author: {
            type: String,
            required: true,
            default: 'john doe'
        } 
    }
})


module.exports = mongoose.model('MovieSchema', movieSchema)