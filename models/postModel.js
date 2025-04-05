const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://mandipdimdum:tamang@cluster1.a2o8u.mongodb.net/')

const postSchema = mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    date: {
        type: Date,
        default: Date.now
    },
    contents: String,
     likes: [
        { type: mongoose.Schema.Types.ObjectId,
            ref: "user"}
     ]
})
module.exports = mongoose.model("Post", postSchema);