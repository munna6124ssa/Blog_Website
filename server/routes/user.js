const express = require("express");
const { registerUser, logInUser } = require("../controllers/user.js");
const upload = require("../middleware/multer.js");
const router = express.Router();

router.post("/register",upload.single("profile"),registerUser );
router.post("/login",logInUser);


module.exports = router; 