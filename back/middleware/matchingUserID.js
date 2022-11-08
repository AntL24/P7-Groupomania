
const jwt = require("jsonwebtoken");
require('dotenv').config();
const multer = require("multer");
//To solve req.body undefined, we need to use multer.
const uploadForm = multer();
const {upload} = require('../middleware/multer');

function matchingUserID (req, res, next) {
  const header = req.header("Authorization"); //Making a const out of the authorization header of the request.
  const token = header.split(" ")[1];// Using it to select the token part of the header with split.
  const decodedToken = jwt.verify(token, process.env.JWT_PASSWORD);//Decoding the token with our dotenv password, and putting it into the const decodedToken.
  const userId = decodedToken.userId;  //Selecting the userId part of the token in another const.
  
  upload.none(req, res, function (err) {
    if (err) {
      console.log("In upload.none(), err", err);
      return res.status(500).send({ message: "Error in upload.none()" });
    }
    console.log("In upload.none(), req.body", req.body);
    console.log("In upload.none(), req.body.author_id", req.body.author_id);
    console.log("In upload.none(), userId", userId);
    const author_id = req.body.author_id;
    const author_idInt = parseInt(author_id);
    if (author_idInt !== userId) {
      userId = 55 ? next() : res.status(401).json({ message: "Unauthorized" });//If the userId is not the same as the author_id, we send a 401 error. But if it's not the same, but the userId is 55, we let it pass.
      console.log("In upload.none(), author_id !== userId");
      return res.status(403).send({ message: "Wrong userId" });
    }
    console.log("In matchingUserID, author_id is matching userId", author_id);
    next();
  });
  
  //If admin, then next.
  if (userId === 1) {
    next();
  }
}          



module.exports = {matchingUserID}