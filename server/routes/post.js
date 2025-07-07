const express = require("express");
const { isLoggedIn } = require("../middleware/auth");
const { validateImageAspectRatio } = require("../middleware/imageValidation");
const { 
  createPost, 
  likePost, 
  getUserFeed, 
  userAllPost, 
  userComment, 
  getAllComments, 
  getPublicPosts,
  editPost,
  deletePost,
  deleteComment,
  likeComment
} = require("../controllers/post");
const { upload, handleMulterError } = require("../middleware/multer");
const router = express.Router();

// Public routes (no authentication required)
router.get("/public", getPublicPosts);
router.get("/public/comments/:postId", getAllComments);

// Protected routes (authentication required)
router.post('/create', isLoggedIn, upload.single('img'), handleMulterError, createPost);
router.patch('/like', isLoggedIn, likePost);
router.get("/allPost", isLoggedIn, getUserFeed);
router.get("/userFeed", isLoggedIn, userAllPost);
router.post('/comment', isLoggedIn, userComment);
router.get('/comment', isLoggedIn, getAllComments);

// New routes for edit/delete functionality
router.put('/edit/:postId', isLoggedIn, upload.single('img'), handleMulterError, editPost);
router.delete('/delete/:postId', isLoggedIn, deletePost);
router.delete('/comment/:commentId', isLoggedIn, deleteComment);
router.patch('/comment/like', isLoggedIn, likeComment);

module.exports = router;