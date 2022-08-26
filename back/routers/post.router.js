const express = require('express');
const {sendPosts, makePost, sendPostCorrespondingToId, deletePost, modifyPost /*,likePost*/} = require("../controllers/posts.controller");
const {authenticateUser} = require("../middleware/tokenAuth");//authenticateUser will verify user informations (header, password, token)
const {matchingUserID} = require("../middleware/matchingUserID");
const {upload} = require('../middleware/multer');
const postRouter = express.Router();

postRouter.use(authenticateUser);//Refactoring : .use with authenticateUser instead of calling it directly within each request

postRouter.get("/", sendPosts);
postRouter.post("/", upload.single("image"), makePost);
postRouter.get("/:id", sendPostCorrespondingToId);
postRouter.delete("/:id", matchingUserID, deletePost);
postRouter.put("/:id", matchingUserID, upload.single("image"), modifyPost);
// postRouter.post("/:id/like", likePost);


module.exports = {postRouter}