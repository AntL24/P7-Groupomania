const client = require("../pgsql_db");
const jwt = require("jsonwebtoken");

//sendPosts will send all posts to display on the webpage.
function sendPosts(req, res){
    client.query("SELECT * FROM posts")
        .then((posts) => res.send(posts.rows))
        .catch((err) => res.status(500).send(err));
}
//getPost is called inside the next function, it will return a particular post, matching the id of request params.
async function getPost(req, res){
    const { id } = req.params
    post = await client.query("SELECT * FROM posts WHERE id = $1", [id])
    return post.rows[0]
}
//sendPostCorrespondingToId will take the post returned by getPost.
//and finally sending it to display on the specific page.
function sendPostCorrespondingToId(req, res) {
    getPost(req, res)
        .then((postRow) => res.status(200).send(postRow))
        .catch((err)=> res.status(500).send(err));
}
//deletePost will select in our database the post with the id matching our request params, 
async function deletePost( req, res){
    const { id } = req.params;
    //1) Request to delete is sent to psql.
    try {
        const post = await client.query("DELETE FROM posts WHERE id = $1", [id]);
        //2) If post is not null, delete image.
        if (post.rows[0] != null) deleteImage(post.rows[0]);
        //3) Send response to client.
        res.status(200).send(post.rows[0]);
    } catch (err) {
        res.status(500).send(err);
    }
}
//modifyPost will modify the post with the id matching our request params.
function modifyPost(req, res) {
    const {params : {id}} = req;//Params id = request id.
    const isThereANewImage = req.file != null;//isThereANewImage is a variable that checks true if user has uploaded a new image.
    const payload = createPayload(isThereANewImage, req)//payload is created from the function createPayload.
        //If there is no new image, it immediately returns the request body with no modification.
        //If there is a new image, it will update the Payload with the new image before returning it.
    // post.findByIdAndUpdate(id, payload)//id is then used to select the post to update inside our database, and payload is used to give the new content.
    // the query will return the post that was updated.
    client.query("UPDATE posts SET body = $1, shared_picture = $2 WHERE id = $3", [payload.body, payload.imageUrl, id])
        .then ((post => deleteImageWhenModifying(isThereANewImage, post.rows[0])))
        .then (console.log ("post.rows[0]", post.rows[0]))
        .then((res) => console.log("Post updated successfully:", res))
        .catch((err) => console.error("Cannot update post:", err));
}
//     client.query("UPDATE posts SET body = $1, shared_picture = $2 WHERE id = $3", [payload.body, payload.imageUrl, id])
//         .then((post) => deleteImageWhenModifying(isThereANewImage, post))
//         .then((res) => console.log("Post updated successfully:", res))
//         .catch((err) => console.error("Cannot update post:", err));
// }

//createPayload will update the payload with the new image path ONLY IF there is a new image provided within the request body.
function createPayload(isThereANewImage, req){
    //Checking if user has provided us a new image to replace the old one. If not, request body is returned.
    if (!isThereANewImage) return req.body;
    //User has indeed provided us with a new image.
    const payload = JSON.parse(req.body.post);//We parse the payload from the request body of the post.
    //Using createImageUrl function to get the new imageUrl from the request fileName.
    payload.imageUrl = createImageUrl(req, req.file.fileName);//We then replace the old imageUrl with the new inside the existing payload.
    return payload //Payload is returned.
}
//function to create imageUrl for new post.
  function createImageUrl(req, fileName){
    return req.protocol + "://" + req.get("host") + "/images/" + fileName;
}

//deleteImage will delete the image ONLY if post in not null.
function deleteImage(post){ 
    // if (post == null) return //Checking if the post returned by mongoo with sendResponseToClient is null.
    const fileToDelete = post.imageUrl.split("/").at(-1);//Selecting the imageUrl of the post. "at(-1)"" counts one from the end of the array.
    return unlink ("images/" + fileToDelete ) //Using unlink to delete our file in "images" folder.
}

//deleteImage will delete the image ONLY if post in not null.
function deleteImageWhenModifying(newImg, post){
    if (!newImg) return //Checking if a new image was uploaded by user. If not, return immediately.
    // if (post == null) return //Checking if the post returned by psql with sendResponseToClient is null.
    const fileToDelete = post.imageUrl.split("/").at(-1);//Selecting the imageUrl of the post. "at(-1)"" counts one from the end of the array.
    return unlink ("images/" + fileToDelete ) //Using unlink to delete our file in "images" folder.
}

function makePost(req, res){
//Making one post and saving it on our sql database.
    //checking if a file was provided by user. If not, proceed to create a post without an image, else create a post with an image.
    const {body} = req;
    //Decoding the token from the request header to get the user id.
    const header = req.header("Authorization"); //Making a const out of the authorization header of the request.
    const token = header.split(" ")[1];// Using it to select the token part of the header with split.
    const decodedToken = jwt.verify(token, process.env.JWT_PASSWORD);//Decoding the token with our dotenv password, and putting it into the const decodedToken.
    const userId = decodedToken.userId;//Selecting the userId part of the decodedToken.
    const ThereIsANewImage = req.file != null;
    if (!ThereIsANewImage){
        console.log("No image provided");
        //The query will return the row that was created.
                client.query("INSERT INTO posts (body, author_id) VALUES ($1, $2) RETURNING *", [body, userId])
                    .then((post) => res.status(200).send(post.rows[0]))
                    .catch((err) => res.status(500).send(err));
    } else {
        console.log("Image provided");
        //The query will return the posts row that was created.
        client.query("INSERT INTO posts (body, author_id, shared_picture) VALUES ($1, $2, $3) RETURNING *", [body, userId, createImageUrl(req, req.file.fileName)] )
            .then((post) => res.status(200).send(post.rows[0]))
            .catch((err) => res.status(500).send(err));
    }
}


                   



// //LIKES & DISLIKES FUNCTIONS
// function likePost (req, res) {
//     const {like, userId} = req.body;
//     if (![0, -1, 1].includes(like)) return res.status(403).send({message : "Like request is invalid : incorrect value"}); //Bad values are immediately rejected.
//     getPost(req, res)
//         //Calling updateVoteCounter to update both post likes and usersLiked (or usersDisliked) accordingly.
//         .then((post) => updateVoteCounter(post, like, userId, res))
//         //Saving updated post on server.
//         .then((post) => post.save())
//         //Using sendResponseToClient to handle the response from our database.
//         .then((post) => sendResponseToClient(post, res))
//         //If we get an err back, we send it with a status 500.
//         .catch((err) =>  res.status(500).send(err));
// }

// function updateVoteCounter( post, like, userId, res){
//     if (like === 1 || like === -1) return incrementVoteCounter(post, userId, like)
//     /*if (like === 0)*/ return setVoteToZero(post, userId, res)//Calling function to decrement the vote count on the post and taking userId out of the voters.
// }

// function incrementVoteCounter(post, userId, like){
//     const {usersLiked, usersDisliked} = post; //Declaring consts for both usersLiked and usersDisliked in post.
//     const usersArray = like === 1 ? usersLiked : usersDisliked; //Is like equal to one ? If yes, usersArray = usersLiked, if not it's equal to usersDisliked.
//     if (usersArray.includes(userId)) return post //If userId is already inside the array, post is returned immediately.
//     usersArray.push(userId);//If not, we push UserId in the array,
//     like === 1 ? ++post.likes : ++post.dislikes; //and we increment the post likes (or dislikes) before returning the post.
//     return post;
// }
// function setVoteToZero(post, userId, res) {
//     const { usersLiked, usersDisliked } = post
//     //On gère les cas d'erreur avant toute autre chose.
//     if ([usersLiked, usersDisliked].every((arr) => arr.includes(userId)))//If userId is found on both usersLiked and usersDisliked, return.
//     //Forcing catch with Promise.reject.
//     return Promise.reject("A given user cannot register both dislikes and likes on the same post")

//     if (![usersLiked, usersDisliked].some((arr) => arr.includes(userId)))//If userId cannot be found in at least one array (usersLiked or usersDisliked), return.
//     return Promise.reject("cannot register 0 vote");
//     //UserId can only be found in either usersLiked or usersDisliked :
//     //Taking userId out of it, with filter.
//     if (usersLiked.includes(userId)) {//usersLiked
//         --post.likes;
//         post.usersLiked = post.usersLiked.filter((id) => id !== userId)
//     }else{
//         --post.dislikes;//usersDisliked
//         post.usersDisliked = post.usersDisliked.filter((id) => id !== userId)
//     }
//     return post
// }

module.exports = {getPost, sendPosts, makePost, sendPostCorrespondingToId, deletePost, modifyPost}//, likePost}
