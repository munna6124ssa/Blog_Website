const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
    title:{type:String , required:true},
    content: {type:String, required: true},
    image:{type:String},
    likes:[{type:mongoose.Schema.Types.ObjectId , ref:"User"}],
    comments:[{type:mongoose.Schema.Types.ObjectId , ref:"Comment"}],
    createdBy:{type:mongoose.Schema.Types.ObjectId , ref:"User"}
},{timestamps:true});

const Post = mongoose.model("Post",postSchema);

module.exports = Post;