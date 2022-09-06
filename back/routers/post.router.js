const express = require('express');
const {deleteOutdatedLocalPicture, sendPosts, makePost, sendPostCorrespondingToId, deletePost, modifyPost, likePost, getCommentsByParentId, createComment, deleteComment, modifyComment, getAllComments, getCommentsByPostId} = require("../controllers/posts.controller");
const {authenticateUser} = require("../middleware/tokenAuth");//authenticateUser will verify user informations (header, password, token)
const {matchingUserID} = require("../middleware/matchingUserID");
const {upload} = require('../middleware/multer');
const postRouter = express.Router();
////////////////////////////////////
postRouter.use(authenticateUser);//Refactoring : .use with authenticateUser instead of calling it directly within each request
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
postRouter.get("/", sendPosts);//Display all posts
postRouter.post("/", upload.single('image'), makePost);//Create a post
postRouter.get("/:id", sendPostCorrespondingToId);//Display a post corresponding to its id
postRouter.delete("/:id", matchingUserID, deleteOutdatedLocalPicture, deletePost);//Delete a post and its corresponding local picture if it exists
postRouter.put("/:id", matchingUserID, deleteOutdatedLocalPicture, upload.single('image'), modifyPost);//Modify a post and its corresponding local picture if it exists
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

postRouter.get("/allcomments", getAllComments);//Display all comments no matter where they were posted to easily moderate them.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
postRouter.post("/:id/like", likePost);//Votes functionnality
//////////////////////////////////////////////////////////////
postRouter.post("/:id/comments/", createComment);//Commenting on a post
postRouter.post("/:id/comments/:commentId", createComment);//Answering a comment

postRouter.get("/:id/allcomments/", getCommentsByPostId);//Display all comments corresponding to a post id

postRouter.get("/:id/comments/", getCommentsByParentId);//Can be used to get all comments responding to a post
postRouter.get("/:id/comments/:commentId", getCommentsByParentId);//Can be used to get all answers to a comment

postRouter.put("/:id/comments/:commentId", matchingUserID, modifyComment);//Modify a comment
postRouter.delete("/:id/comments/:commentId", matchingUserID, deleteComment);//Delete a comment
////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = {postRouter}