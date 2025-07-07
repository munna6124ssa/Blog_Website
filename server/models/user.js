const mongoose = require ("mongoose");

const UserSchema = mongoose.Schema({
    name:{type:String , required:true , trim:true},
    email:{type:String , required:true , unique:true , lowercase:true},
    gender:{type:String , enum:['male','female','other']},
    userName:{type:String , required:true, lowercase:true},
    age:{type:Number},
    profile:{type:String, default: ""},
    coverImage:{type:String, default: ""}, // New: Cover image for profile
    about:{type:String, default: "", maxlength: 500}, // New: About section
    location:{type:String, default: ""}, // New: User location
    website:{type:String, default: ""}, // New: Personal website/portfolio
    joinedDate:{type:Date, default: Date.now}, // New: When user joined
    isEmailVerified:{type:Boolean, default: false}, // New: Email verification status
    emailVerificationToken:{type:String, default: ""}, // New: Email verification token
    emailVerificationExpires:{type:Date}, // New: Token expiration
    emailOTP:{type:String, default: ""}, // New: OTP for email verification
    emailOTPExpires:{type:Date}, // New: OTP expiration
    passwordResetToken:{type:String, default: ""}, // New: Password reset token
    passwordResetExpires:{type:Date}, // New: Reset token expiration
    emailNotifications:{type:Boolean, default: true}, // New: Email notification preferences
    password:{type:String , required:true , min:8 ,trim:true},
    posts:[{type:mongoose.Schema.Types.ObjectID,ref:'Post'}]

}, {timestamps:true})


const User = mongoose.model("User" , UserSchema);

module.exports = User ;