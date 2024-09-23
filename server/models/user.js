const mongoose = require ("mongoose");

const UserSchema = mongoose.Schema({
    name:{type:String , required:true , trim:true},
    email:{type:String , required:true , unique:true , lowercase:true},
    gender:{type:String , enum:['male','female','other']},
    userName:{type:String , required:true},
    age:{type:Number},
    profile:{type:String},
    userName:{type:String , lowercase:true},
    password:{type:String , required:true , min:8 ,trim:true},
    posts:[{type:mongoose.Schema.Types.ObjectID,ref:'Post'}]

}, {timestamps:true})


const User = mongoose.model("User" , UserSchema);

module.exports = User ;