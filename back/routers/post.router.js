const express = require('express');
const {deleteOutdatedLocalPicture, handleFilesBeforeModify, sendPosts, makePost, sendPostCorrespondingToId, deletePost, modifyPost, likePost, createComment, deleteComment, modifyComment, getAllComments, getCommentsByPostId, consoleLogTest, getRootCommentsByPostId, getChildCommentsByRootCommentId}= require("../controllers/posts.controller");
const {authenticateUser} = require("../middleware/tokenAuth");//authenticateUser will verify user informations (header, password, token)
const {matchingUserID} = require("../middleware/matchingUserID");
const {upload} = require('../middleware/multer');
const postRouter = express.Router();
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
postRouter.use(authenticateUser);//Refactoring : .use with authenticateUser instead of calling it directly within each request
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
postRouter.get("/", sendPosts);//Display all posts
postRouter.post("/", upload.single('image'), makePost);//Create a post
postRouter.get("/:id", sendPostCorrespondingToId);//Display a post corresponding to its id
postRouter.delete("/:id", deleteOutdatedLocalPicture, deletePost);//Delete a post and its corresponding local picture if it exists
postRouter.put("/:id", upload.single('image'), handleFilesBeforeModify, modifyPost);//Modify a post and its corresponding local picture if it exists
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
postRouter.post("/:id/like", likePost);//Votes functionnalities
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
postRouter.post("/:id/comments/", createComment);//Commenting on a post
postRouter.post("/:id/comments/:commentId/:rootId", createComment);//Commenting on a comment
postRouter.get("/:id/comments/rootComments", getRootCommentsByPostId);//Display all comments corresponding to a post id
postRouter.get("/:id/comments/rootComments/:rootId", getChildCommentsByRootCommentId);//Get all comments corresponding to a root id
postRouter.get("/:id/comments/", getCommentsByPostId);//Get all comments corresponding to a post id
postRouter.put("/:id/comments/:commentId", matchingUserID, modifyComment);//Modify a comment
postRouter.delete("/:id/comments/:commentId", matchingUserID, deleteComment);//Delete a comment
////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = {postRouter}