const mongoose = require('mongoose');
// const validator = require("validator");


const postSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
        trim: true
    },
    body: {
        type: String,
        require: true
    },
    createdBy: {
        type: String,
        required: true

    },
    active: {
        type: Boolean,
        required: true
    },
    geoLocation: {
        type: String,
        // required: true,
        latitude : {
            type: String,
            default: '0'
        },
        longitude : {
            type: String,
            default: '0'
        }
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})


const Post = mongoose.model('Post', postSchema)


module.exports = Post;