const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { cloudinaryUplaod } = require("../middleware/cloudinary.js");



const registerUser = async (req, res) => {
  try {
    const { name, password, email, age, gender } = req.body;
    if (!name.trim() || !email.trim() || !password.trim())
      return res.status(400).json("name,email,password is required");

    const isUser = await User.findOne({ email });
    if (isUser) return res.status(400).json("user already exists");

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const dataArr = email.split("@");
    const userName = dataArr[0];
    const response = await cloudinaryUplaod(req.file.path);

    const newUser = await User.create({
      name,
      email,
      password: hash,
      gender,
      age,
      userName,
      profile:response.url,
    });

    const user = await User.findById(newUser._id).select("-password");
    return res
      .status(201)
      .json({ message: "User successfully registered", data: user });
  } catch (error) {
    console.log("Error while user registration", error);
    res.status(500).json(`error due to user registration ${error}`);
  }};


  const logInUser = async (req,res)=>{
    try {
        const {email,password}=req.body;
        if(!email.trim()||!password.trim())
        return res.status(400).json("email , password is required");

        const isUser = await User.findOne({email:email});
        if(!isUser) return res.status(404).json.message("user not found");


        const isMatch = await bcrypt.compare(password,isUser.password);
        if(!isMatch) return res.status(400).json("invalid password");

        const token = await jwt.sign({
            id:isUser._id,
            email:isUser.email
        },
            process.env.JWT_SECRET,{expiresIn:"1d"});

        const loggedInUser = {...isUser.toObject() , token};
        delete loggedInUser.password;
        return res.status(202).json({message:"LogIn Successful" , data:loggedInUser});

    } catch (error) {
        console.log("error in user login",error);
        res.status(500).json(error.message);
        
    }
};


module.exports = { registerUser, logInUser };
