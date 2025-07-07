const { cloudinaryUplaod } = require("../middleware/cloudinary.js");
const Post = require("../models/post.js");
const User = require("../models/user.js");
const Comment = require("../models/comment.js");
const emailService = require("../utils/emailService.js");

const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title?.trim()) return res.status(400).json("Title is required");

    let imageUrl = "";

    // Only try to upload to Cloudinary if there's a file
    if (req?.file?.path) {
      try {
        const response = await cloudinaryUplaod(req.file.path);
        imageUrl = response?.url || "";
      } catch (cloudinaryError) {
        // Continue without image if Cloudinary fails
        imageUrl = "";
      }
    }

    const newPost = await Post.create({
      title,
      content: content || "",
      image: imageUrl,
      createdBy: req.user._id,
    });

    const post = await Post.findById(newPost._id).populate({
      path: "createdBy",
      select: "name userName profile",
    });

    // Update user's posts array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { posts: newPost._id } }
    );

    return res.status(201).json({ message: "Post created", data: post });
  } catch (error) {
    return res.status(500).json(`Error in post creation: ${error.message}`);
  }
};

const likePost = async (req, res) => {
  try {
    const { postId } = req.body;
    if (!postId) {
      return res.status(400).json({ 
        success: false, 
        message: "Post id required" 
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: "Post not found" 
      });
    }

    // Prevent users from liking their own posts
    if (String(post.createdBy) === String(req.user._id)) {
      return res.status(400).json({ 
        success: false, 
        message: "You cannot like your own post" 
      });
    }

    const likes = post.likes;
    const indexAt = likes?.findIndex(
      (elm) => String(elm) == String(req.user._id)
    );
    
    let message;
    let isLiked = false;
    if (indexAt >= 0) {
      // User is unliking the post
      likes.splice(indexAt, 1);
      message = "Post unliked";
      isLiked = false;
    } else {
      // User is liking the post
      likes.push(req.user._id);
      message = "Post liked";
      isLiked = true;
      
      // Send email notification to post author (only when liked, not unliked)
      try {
        const postAuthor = await User.findById(post.createdBy);
        const liker = await User.findById(req.user._id);
        
        if (postAuthor && postAuthor.emailNotifications && postAuthor.isEmailVerified && 
            postAuthor._id.toString() !== liker._id.toString()) {
          const postUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/post/${post._id}`;
          
          const result = await emailService.sendLikeNotification(
            postAuthor.email,
            postAuthor.name,
            liker.name,
            post.title,
            postUrl
          );
        }
      } catch (emailError) {
        // Don't fail the like operation if email fails
      }
    }
    
    post.likes = likes;
    await post.save();
    
    return res.status(200).json({ 
      success: true,
      message, 
      likesCount: likes.length,
      isLiked
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Error liking post",
      error: error.message 
    });
  }
};

const getUserFeed = async (req, res) => {
  try {
    const allPost = await Post.find({})
      .populate({
        path: 'createdBy',
        select: 'name userName profile'
      })
      .populate({
        path: 'likes',
        select: 'name userName'
      })
      .populate({
        path: 'comments',
        select: '_id'
      })
      .sort({ createdAt: -1 });
    return res.status(200).json(allPost);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const userAllPost = async (req, res) => {
  try {
    const allUserPost = await Post.find({ createdBy: req.user._id })
      .populate({
        path: 'createdBy',
        select: 'name userName profile'
      })
      .populate({
        path: 'likes',
        select: 'name userName'
      })
      .populate({
        path: 'comments',
        select: '_id'
      })
      .sort({ createdAt: -1 });
    return res.status(200).json(allUserPost);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const userComment = async (req, res) => {
  try {
    const { content, postId, commentId } = req.body;

    if (postId) {
      // Check if user is trying to comment on their own post
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json("Post not found");
      
      if (String(post.createdBy) === String(req.user._id)) {
        return res.status(400).json("You cannot comment on your own post");
      }
    }

    const newComment = new Comment({
      content,
      comments: [],
      createdBy: req.user._id,
    });

    await newComment.save();

    if (postId) {
      let post = await Post.findById(postId).populate("comments");
      if (!post) return res.status(404).json("Post not found");

      post.comments.push(newComment);
      await post.save();

      // Send email notification to post author
      try {
        const postAuthor = await User.findById(post.createdBy);
        const commenter = await User.findById(req.user._id);
        
        if (postAuthor && postAuthor.emailNotifications && postAuthor.isEmailVerified && 
            postAuthor._id.toString() !== commenter._id.toString()) {
          const postUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/post/${post._id}`;
          
          const result = await emailService.sendCommentNotification(
            postAuthor.email,
            postAuthor.name,
            commenter.name,
            post.title,
            content,
            postUrl
          );
        }
      } catch (emailError) {
        // Don't fail the comment operation if email fails
      }

      res.status(201).json({ message: "comment added", data: post });
    } else if (commentId) {
      let comment = await Comment.findById(commentId).populate("comments");

      if (!comment) return res.status(404).json("Comment not found");

      comment.comments.push(newComment);
      await comment.save();

      res.status(201).json({ message: "comment added", data: comment });
    } else res.status(404).json({ message: "id not found" });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const getAllComments = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id.trim())
      return res
        .status(400)
        .json({ status: false, message: "Post ID is required" });

    const post = await Post.findById(id).populate({
      path: 'comments',
      populate: {
        path: 'createdBy',
        select: 'name userName profile'
      }
    });

    async function populateComments(comment) {
      await comment.populate({
        path: 'comments',
        populate: {
          path: 'createdBy',
          select: 'name userName profile'
        }
      });             

      for (const nestedComment of comment.comments)
        await populateComments(nestedComment);
    }

    for (const comment of post.comments) await populateComments(comment);

    return res
      .status(200)
      .json({ message: "Fetch successful", data: post.comments });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getPublicPosts = async (req, res) => {
  try {
    const allPost = await Post.find({})
      .populate({
        path: 'createdBy',
        select: 'name userName profile'
      })
      .populate({
        path: 'likes',
        select: 'name userName'
      })
      .populate({
        path: 'comments',
        select: '_id'
      })
      .sort({ createdAt: -1 });
    return res.status(200).json(allPost);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

// Edit Post
const editPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "Title is required" 
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: "Post not found" 
      });
    }

    // Check if user is the author
    if (String(post.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only edit your own posts" 
      });
    }

    // Handle new image upload if provided
    let imageUrl = post.image;
    if (req?.file?.path) {
      try {
        const response = await cloudinaryUplaod(req.file.path);
        imageUrl = response?.url || post.image;
      } catch (cloudinaryError) {
        // Keep existing image if new upload fails
      }
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        title,
        content: content || "",
        image: imageUrl,
        isEdited: true,
        editedAt: new Date()
      },
      { new: true }
    ).populate({
      path: "createdBy",
      select: "name userName profile",
    });

    return res.status(200).json({ 
      success: true,
      message: "Post updated successfully", 
      data: updatedPost 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Error updating post",
      error: error.message 
    });
  }
};

// Delete Post
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: "Post not found" 
      });
    }

    // Check if user is the author
    if (String(post.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only delete your own posts" 
      });
    }

    // Delete all comments associated with this post
    await Comment.deleteMany({ postId: postId });

    // Remove post from user's posts array
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { posts: postId } }
    );

    // Delete the post
    await Post.findByIdAndDelete(postId);

    return res.status(200).json({ 
      success: true,
      message: "Post deleted successfully" 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Error deleting post",
      error: error.message 
    });
  }
};

// Delete Comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: "Comment not found" 
      });
    }

    // Check if user is the comment author only
    const isCommentAuthor = String(comment.createdBy) === String(req.user._id);

    if (!isCommentAuthor) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only delete your own comments" 
      });
    }

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    // Remove the comment from the post's comments array
    await Post.findByIdAndUpdate(
      comment.postId,
      { $pull: { comments: commentId } }
    );

    return res.status(200).json({ 
      success: true,
      message: "Comment deleted successfully" 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Error deleting comment",
      error: error.message 
    });
  }
};

// Like Comment
const likeComment = async (req, res) => {
  try {
    const { commentId } = req.body;

    if (!commentId) {
      return res.status(400).json({ 
        success: false, 
        message: "Comment id required" 
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: "Comment not found" 
      });
    }

    // Users can like any comment (including their own for comments)
    const likes = comment.likes || [];
    const indexAt = likes.findIndex(
      (elm) => String(elm) === String(req.user._id)
    );
    
    let message;
    if (indexAt >= 0) {
      likes.splice(indexAt, 1);
      message = "Comment unliked";
    } else {
      likes.push(req.user._id);
      message = "Comment liked";
    }
    
    comment.likes = likes;
    await comment.save();
    
    return res.status(200).json({ 
      success: true,
      message, 
      likesCount: likes.length,
      isLiked: indexAt < 0
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Error liking comment",
      error: error.message 
    });
  }
};

module.exports = {
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
  likeComment,
};
