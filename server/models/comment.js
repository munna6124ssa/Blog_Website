const mongoose = require("mongoose");

const commentSchema =mongoose.Schema({
    content:{type:String , required:true},
    createdBy:{type:mongoose.Schema.Types.ObjectId , ref:"User"},
    likes: [{type: String}],
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: "Comment"}]
},{timestamps:true})

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment ;