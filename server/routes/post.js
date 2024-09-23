const express = require("express");
const { isLoggedIn } = require("../middleware/auth");
const { createPost, likePost, getUserFeed, userAllPost, userComment, getAllComments } = require("../controllers/post");
const upload = require("../middleware/multer");
const router  = express.Router();

router.post('/create',isLoggedIn,upload.single('img'),createPost);
router.patch('/like',isLoggedIn,likePost);
router.get("/allPost",isLoggedIn,getUserFeed);
router.get("/userFeed",isLoggedIn,userAllPost);
router.post('/comment',isLoggedIn,userComment)
router.get('/comment',isLoggedIn,getAllComments)

module.exports = router;