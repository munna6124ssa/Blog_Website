const { cloudinaryUplaod } = require("../middleware/cloudinary.js");
const Post = require("../models/post.js");
const User = require("../models/user.js");
const Comment = require("../models/comment.js");

const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title?.trim()) return res.status(400).json("Title is required");

    let response;

    if (req?.file?.path) {
      response = await cloudinaryUplaod(req.file.path);
    }

    console.log(req.body);

    const newPost = await Post.create({
      title,
      content,
      image: response ? response.url : "",
      createdBy: req.user._id,
    });

    const post = await Post.findById(newPost._id).populate({
      path: "createdBy",
      select: "name",
    });
    const user = await User.findById(req.user._id);
    const posts = [...user.posts, newPost._id];
    user.posts = posts;
    await user.save();
    return res.status(201).json({ message: "Post created", data: post });
  } catch (error) {
    console.error("Error in post creation", error);
    return res.status(500).json(`Error in post creation ${error.message}`);
  }
};

const likePost = async (req, res) => {
  try {
    const { postId } = req.body;
    if (!postId) return res.status(400).json("Post id required");

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json("Post not found");

    const likes = post.likes;
    const indexAt = likes?.findIndex(
      (elm) => String(elm) == String(req.user._id)
    );
    let message;
    if (indexAt >= 0) {
      likes.splice(indexAt, 1);
      message = "Dislike";
    } else {
      likes.push(req.user._id);
      message = "like";
    }
    post.likes = likes;
    await post.save();
    return res.status(201).json(message);
  } catch (error) {
    console.log("Error in post like", error);
    return res.status(500).json(error.message);
  }
};

const getUserFeed = async (req, res) => {
  try {
    const allPost = await Post.find({});
    return res.status(200).json(allPost);
  } catch (error) {
    console.log("error in fetching all feeds", error);
    return res.status(500).json(error.message);
  }
};

const userAllPost = async (req, res) => {
  try {
    const allUserPost = await Post.find({ createdBy: req.user._id });
    return res.status(200).json(allUserPost);
  } catch (error) {
    console.log("error in fetching posts");
    return res.status(500).json(error.message);
  }
};

const userComment = async (req, res) => {
  try {
    const { content, postId, commentId } = req.body;

    console.log(req.body);

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

      res.status(201).json({ message: "comment added", data: post });
    } else if (commentId) {
      let comment = await Comment.findById(commentId).populate("comments");

      if (!comment) return res.status(404).json("Comment not found");

      comment.comments.push(newComment);
      await comment.save();

      res.status(201).json({ message: "comment added", data: comment });
    } else res.status(404).json({ message: "id not found" });
  } catch (error) {
    console.log("error in creating comment");
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

    const post = await Post.findById(id).populate("comments");

    async function populateComments(comment) {
      await comment.populate("comments");             

      for (const nestedComment of comment.comments)
        await populateComments(nestedComment);
    }

    for (const comment of post.comments) await populateComments(comment);

    return res
      .status(200)
      .json({ message: "Fetch successful", data: post.comments });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createPost,
  likePost,
  getUserFeed,
  userAllPost,
  userComment,
  getAllComments,
};
