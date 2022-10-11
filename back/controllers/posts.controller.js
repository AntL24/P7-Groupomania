const client = require("../pgsql_db");
const jwt = require("jsonwebtoken");
const { unlink } = require("fs/promises");
const { request } = require("http");

//sendPosts will send all posts to display on the webpage.
function sendPosts(req, res){
    client.query("SELECT * FROM posts ORDER BY post_date DESC")
        .then((posts) => res.send(posts.rows))
        .catch((err) => res.status(500).send(err));
}
//sendPostCorrespondingToId will take the post row returned by getPost.
//and send it to display on the specific page.
function sendPostCorrespondingToId(req, res) {
    //In psqldb, we select the post with the id matching our request params.
    //Knowing that the id in psql is an integer.
    getPost(req ,res)
        .then((post) => manageQueryResult(post.rows[0], res))
        .catch((err)=> res.status(500).send(err));
}
// getPost is called inside the previous function, it will return a particular post, matching the id of request params.
//Ensure that the id argument is a number.
async function getPost(req, res) {
    const { id } = req.params;
    return await client.query("SELECT * FROM posts WHERE id = $1", [id]);
}
//function that will check if the query result is null or not. If not, send within a promise the post obtained to the client.
function manageQueryResult(queryResult, res){
    if (queryResult == null) return res.status(404).send("Post not found");
    return Promise.resolve(res.status(200).send(queryResult)).then(() => queryResult);
}

//deletePost will select in our database the post with the id matching our request params, 
function deletePost(req, res){
    const { id } = req.params;
    try {
        client.query ("DELETE FROM posts WHERE id = $1", [id])
    } catch (err) {
        res.status(500).send(err);
    }
    res.status(200).send("Post deleted");
}
function handleFilesBeforeModify(req, res, next){
//Check if there is a file in the request.
    const ThereIsANewImage = req.file != null; //Checking if the user has uploaded a new image.
    console.log("in fileCheckBeforeModify, Check ThereIsANewImage:", ThereIsANewImage);
//If there is no file, proceed to next function.
    if (!ThereIsANewImage) return next();
    console.log("file is:", req.file);
    deleteOutdatedLocalPicture(req, res, next);
}
function deleteOutdatedLocalPicture(req, res, next){
//First, exclude any userId not matching the auth
    console.log("In deleteOutdatedLocalPicture, req.body.author_id:", req.body.author_id, "req.body.user_id:", req.body.user_id);
    const author_id = req.body.author_id;
    const user_id = req.body.user_id;
//Check identity of user. If not authorized, delete the file he may have uploaded, and send a 403 error.
    if (author_id != user_id && user_id != 1) {
        // console.log("in deleteOutdatedLocalPicture, user not authorized, as user_id is:", user_id, "and author_id is:", author_id);
        // console.log("file is:", req.file);
            const file = req.file;
            const fileName = file.fileName;
            const filePath = `images/${fileName}`;
            // console.log("in deleteOutdatedLocalPicture, deleting file:", filePath);
            unlink(filePath)
            return res.status(403).send({ message: "Wrong userId" });
    }
//The user is confirmed to be the author of the post, or the admin. Proceed to delete the old picture.
    console.log("in deleteOutdatedLocalPicture, searching for picture of selected post.");
        client.query("SELECT shared_picture FROM posts WHERE id = $1", [req.params.id])
            .then((post) => {
                if (post.rows[0].shared_picture === null) return next();
                //If there is no picture, proceed to next function.
                // console.log('in deleteOutdatedLocalPicture, there is a picture, deleting :', post.rows[0].shared_picture);
                const fileToDelete = post.rows[0].shared_picture.split("/").at(-1);
                return unlink("images/" + fileToDelete); //VERIFIER S'IL FAUT ECRIRE COMME CA, OU COME PLUS HAUT "images/${fileToDelete}"
            })
            .then(() => next())
            .catch((err) => res.status(500).send(err));
}

//modifyPost will modify the post with the id matching our request params.
function modifyPost(req, res) {
    //Making one post and saving it on our sql database.
        //checking if a file was provided by user. If not, proceed to create a post without an image, else create a post with an image.
        const {body} = req.body;
        //Checking if a file was provided by user. If not, proceed to create a post without an image, else create a post with an image.
        const ThereIsANewImage = req.file != null;
        if (!ThereIsANewImage){
            //The query will return the row that was created.
                    client.query("UPDATE posts SET body = $1 WHERE id = $2 RETURNING *", [body, req.params.id])
                        .then((post) => res.status(200).send(post.rows[0]))
                        .catch((err) => res.status(500).send(err));
        } else {
            //We will use the file property of the request to get the file.
            const file = req.file;
            //Using the createImageUrl function to get the new imageUrl from the request fileName.
            const imageUrl = createImageUrl(req, file.fileName);
            //The query will return the row that was created.
            client.query("UPDATE posts SET body = $1, shared_picture = $2 WHERE id = $3 RETURNING *", [body, imageUrl, req.params.id])
                .then((post) => res.status(200).send(post.rows[0]))
                .catch((err) => res.status(500).send(err))
        }    
}
//function to create imageUrl for new post.
  function createImageUrl(req, fileName){
    console.log("req.file.fileName", req.protocol + "://" + req.get("host") + "/images/" + fileName);
    return req.protocol + "://" + req.get("host") + "/images/" + fileName;
}

function makePost(req, res){
//Making one post and saving it on our sql database.

    //checking if a file was provided by user. If not, proceed to create a post without an image, else create a post with an image.
    const {body} = req.body;
    //Make a string with body.
    console.log("body", body);

    //Decoding the token from the request header to get the user id.
    const header = req.header("Authorization"); //Making a const out of the authorization header of the request.
    const token = header.split(" ")[1]// Using it to select the token part of the header with split.
    const decodedToken = jwt.verify(token, process.env.JWT_PASSWORD);//Decoding the token with our dotenv password, and putting it into the const decodedToken.
    const userId = decodedToken.userId;//Selecting the userId part of the decodedToken.
    
    //Checking if a file was provided by user. If not, proceed to create a post without an image, else create a post with an image.
    const ThereIsANewImage = req.file != null;

    if (!ThereIsANewImage){
        //The query will return the row that was created.
                client.query("INSERT INTO posts (body, author_id, likes, dislikes) VALUES ($1, $2, $3, $4) RETURNING *", [body, userId, 0, 0])
                    .then((post) => res.status(200).send(post.rows[0]))
                    .catch((err) => res.status(500).send(err));
    } else {
        //We will use the file property of the request to get the file.
        const file = req.file;
        //Using the createImageUrl function to get the new imageUrl from the request fileName.
        const imageUrl = createImageUrl(req, file.fileName);
        //The query will return the row that was created.
        client.query("INSERT INTO posts (body, author_id, shared_picture, likes, dislikes) VALUES ($1, $2, $3, $4, $5) RETURNING *", [body, userId, imageUrl, 0, 0])
            .then((post) => res.status(200).send(post.rows[0]))
            .catch((err) => res.status(500).send(err))
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//COMMENTS FUNCTIONS///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function createComment(req, res){
    //Making one comment and saving it on our sql database.
    //Decoding the token from the request header to get the user id.
    const header = req.header("Authorization"); //Making a const out of the authorization header of the request.
    const token = header.split(" ")[1]// Using it to select the token part of the header with split.
    const decodedToken = jwt.verify(token, process.env.JWT_PASSWORD);//Decoding the token with our dotenv password, and putting it into the const decodedToken.
    const userId = decodedToken.userId;//Selecting the userId part of the decodedToken.
    const commentId = req.params.commentId;
    console.log("commentId", commentId);
    //First, we treat the case where the user is commenting on a post.
    if (commentId == null){
        console.log("commentId is null, user is commenting on a post");
        //Case where the user is commenting on a post. parent_id is the id of the post.
        client.query("INSERT INTO comments (body, author_id, parent_id, post_id) VALUES ($1, $2, $3, $4) RETURNING *", [req.body.body, userId, req.params.id, req.params.id]) 
            .then((comment) => res.status(200).send(comment.rows[0]))
            .catch((err) => res.status(500).send(err));
        return
    }
    //Case where the user is answering a comment.
    console.log("case where the user is answering a comment");
    client.query("INSERT INTO comments (body, author_id, parent_id, post_id) VALUES ($1, $2, $3, $4) RETURNING *", [req.body.body, userId, commentId, req.params.id])
        .then((comment) => res.status(200).send(comment.rows[0]))
        .catch((err) => res.status(500).send(err));
}
function deleteComment(req, res){
    //Deleting the comment with the id matching our request params.
    client.query("DELETE FROM comments WHERE id = $1", [req.params.commentId])
        .then(() => res.status(200).send("Comment deleted"))
        .catch((err) => res.status(500).send(err));
}
function modifyComment(req, res){
    //Modifying the comment with the id matching our request params.
    client.query("UPDATE comments SET body = $1 WHERE id = $2 RETURNING *", [req.body.body, req.params.commentId])
        .then((comment) => res.status(200).send(comment.rows[0]))
        .catch((err) => res.status(500).send(err));
}
// //send the comments corresponding to the parent_id, which can be a post or a comment.
//  function getCommentsByParentId(req, res){
//     const parentCommentId = req.params.commentId
//     if (parentCommentId){
//         client.query("SELECT * FROM comments WHERE parent_id = $1", [parentCommentId])
//             .then((comments) => res.status(200).send(comments.rows))
//             .catch((err) => res.status(500).send(err));
//     } else {
//     const parentPostId = req.params.id
//     client.query("SELECT * FROM comments WHERE parent_id = $1", [parentPostId]) 
//         .then((comments) => res.status(200).send(comments.rows))
//         .catch((err) => res.status(500).send(err));
//     }
// }
//Display all comments no matter what the parent_id is, to ease moderation.
function getAllComments(req, res){
    //Getting all the comments from the database, ordered by comment_date.
    //We need to avoid error 22P02 (invalid input syntax for integer).
    console.log("OK, in getAllcomments");
    client.query("SELECT * FROM comments")
        .then((comments) => res.status(200).send(comments.rows))
        .then((comment) => console.log("comment", comment))
        .catch((err) => res.status(500).send(console.log("err", err)));
}
    //Transforming the result so that we don't have to deal with the error 22P02.

function consoleLogTest(req, res){
    console.log("OK, in consoleLogTest");
    res.send("OK, in consoleLogTest");
}

//Send all comments from a specific post.
 function getCommentsByPostId(req, res){
    // Get id of last comment sent to client.
    const cursor = req.params.cursor;
    const postId = req.params.id;
    const limit = req.query.limit;
    
    console.log("postId", postId);
    console.log("limit", limit);
    console.log("cursor", cursor);
    //If cursor is null or undefined, we send the first comments.
    if (cursor == null || cursor == undefined){
        console.log("cursor is null or undefined");
        client.query("SELECT * FROM comments WHERE post_id = $1 ORDER BY comment_date ASC LIMIT $2", [postId, limit])
            .then((comments) => res.status(200).send(comments.rows))
            .catch((err) => res.status(500).send(err));
    } else {
        console.log("cursor is not null or undefined");
    //Instead of offset and limit, we could use cursor based pagination. It means that we would use the id of the last comment we sent to the client, and then we would send the next comments after that one.
    client.query("SELECT * FROM comments WHERE id > $1 AND post_id = $2 LIMIT $3", [cursor, postId, limit])
        .then((comments) => res.status(200).send(comments.rows))
        .catch((err) => res.status(500).send(err));
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////:

//     console.log("In getCommentsByPostId", "page:", page, "limit:", limit);
//     //The client.query must not separate nested comments from their parent comments.
//     // Select the oldest 50 comments
//     client.query("SELECT * FROM comments WHERE post_id = $1 ORDER BY comment_date ASC LIMIT $2 OFFSET $3", [postId, limit, page])
//         .then((comments) => {
//             commentsArray = comments.rows
//             console.log("commentsArray", commentsArray);
//             res.status(200).send(commentsArray)
//         })
//         .catch((err) => res.status(500).send(err));
// }

    //Now that commentsArray is filled, we can loop through it to get the comments with parent_id = the comment id.
           
    // client.query("WITH RECURSIVE comments_tree AS (SELECT * FROM comments WHERE post_id = $1 AND parent_id IS NULL UNION ALL SELECT c.* FROM comments c INNER JOIN comments_tree ct ON c.parent_id = ct.id) SELECT * FROM comments_tree LIMIT $2 OFFSET $3", [postId, limit, page])
    //     .then((comments) => res.status(200).send(comments.rows))
    //     .catch((err) => res.status(500).send(err));
    
    // client.query("WITH RECURSIVE comments_tree AS (SELECT * FROM comments WHERE post_id = $1 AND parent_id IS NULL UNION ALL SELECT c.* FROM comments c INNER JOIN comments_tree ct ON c.parent_id = ct.id) SELECT * FROM comments_tree", [postId])
    //     .then((comments) => console.log("comments", comments.rows))
    //We need to paginate the comments and use the limit and offset parameters.
    //We need to use a recursive query.




    
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//LIKES & DISLIKES FUNCTIONS///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function likePost (req, res) {
    const {like, voter_id} = req.body;
    console.log("Inside likePost, like:", like, "voter_id:", voter_id)
    const postId = req.params.id;
    console.log("Inside LikePost, postId:", postId)
    if (![0, -1, 1].includes(like)) return res.status(403).send({message : "Like request is invalid : incorrect value"}); //Bad values are immediately rejected.
    //Do a query with a if statement to check if query result is null.
    const selectedPost = await client.query("SELECT * FROM posts WHERE id = $1", [postId]);
    if (selectedPost.rows[0] === undefined) return res.status(404).send({message : "Post not found"}); //If the post doesn't exist, return a 404 error.
    
    try {
        await updateVoteCounter(like, voter_id, postId)
        const updatedPost = await client.query("SELECT * FROM posts WHERE id = $1", [postId]);
        console.log("updatedPost", updatedPost.rows[0]);
        return res.status(200).send(updatedPost.rows[0]);
    }
    catch (err) {
        res.status(500).send(err)
    }
}
    function updateVoteCounter(like, voter_id, postId){
        console.log("updateVoteCounter")
        if (like === 1 || like === -1) return incrementVote(postId, voter_id, like)
        return setVoteToZero(postId, voter_id)
    }
        async function getNameSurname(voter_id) {//Get name_surname value from users table.
            console.log("voter_id", voter_id)
            const nameSurname = await client.query("SELECT name_surname FROM users WHERE id = $1", [voter_id]);
            console.log("nameSurname", nameSurname.rows[0].name_surname)
            return nameSurname.rows[0].name_surname
        }
        //Increment the vote count on the post and add name_surname to the corresponding voter array.
        async function incrementVote(postId, voter_id, like){
            console.log("incrementVote")
            const name_surname_value = await getNameSurname(voter_id)
            if (like === 1){
                //1 )If product is already liked by user, return an error.
                const alreadyLiked = await client.query("SELECT * FROM posts WHERE id = $1 AND usersliked @> ARRAY[$2]", [postId, name_surname_value]);
                if (alreadyLiked.rows[0] !== undefined) return Promise.reject({message : "You already liked this post"})
                //2 )If product is already disliked by user, we update both arrays according to the new vote.
                const userAlreadyDisliked = await client.query("SELECT usersdisliked FROM posts WHERE id = $1 AND $2 = ANY(usersdisliked)", [postId, name_surname_value]);
                if (userAlreadyDisliked.rows[0] !== undefined) {
                    await client.query("UPDATE posts SET usersdisliked = array_remove(usersdisliked, $1), dislikes = dislikes - 1, dislikersid = array_remove(dislikersid, $2), usersliked = array_append(usersliked, $1), likes = likes + 1, likersid = array_append(likersid, $2) WHERE id = $3", [name_surname_value, voter_id, postId]);
                    return
                } else {
                //3 ) First like for this user, we just add the name_surname to the array, the voter_Id to the votersId array, and increment the likes counter.
                    await client.query("UPDATE posts SET usersliked = array_append(usersliked, $1), likes = likes + 1, likersid = array_append(likersid, $3) WHERE id = $2", [name_surname_value, postId, voter_id]);
                    return
                }
            }
            if (like === -1){
                //1 )Return error if user is trying to dislike a post he already disliked.
                const alreadyDisliked = await client.query("SELECT * FROM posts WHERE id = $1 AND usersdisliked @> ARRAY[$2]", [postId, name_surname_value]);
                if (alreadyDisliked.rows[0] !== undefined) return Promise.reject({message : "You already disliked this post"})
                //2 )If product is trying to change his like to a dislike, we update both arrays according to the new vote.
                const userAlreadyLiked = await client.query("SELECT usersliked FROM posts WHERE id = $1 AND $2 = ANY(usersliked)", [postId, name_surname_value]);
                if (userAlreadyLiked.rows[0] !== undefined) {
                    await client.query("UPDATE posts SET usersliked = array_remove(usersliked, $1), likes = likes - 1, likersid = array_remove(likersid, $2), usersdisliked = array_append(usersdisliked, $1), dislikes = dislikes + 1, dislikersid = array_append(dislikersid, $2) WHERE id = $3", [name_surname_value, voter_id, postId]);
                    return 
                } else {
                //3 )First dislike for this user, we just add the name_surname to the array and increment the dislikes counter.
                    await client.query("UPDATE posts SET usersdisliked = array_append(usersdisliked, $1), dislikes = dislikes + 1, dislikersid = array_append(dislikersid, $3) WHERE id = $2", [name_surname_value, postId, voter_id]);
                    return 
                }
            }
        }
        //Reset the vote count on the post and remove name_surname from the corresponding voter array.
        async function setVoteToZero(postId, voter_id) {
            console.log("setVoteToZero")
            const name_surname_value = await getNameSurname(voter_id)
            console.log(name_surname_value)
            //Check all occurrences of name_surname for current user in usersLiked and usersDisliked arrays.
            const usersLiked = await client.query("SELECT usersLiked FROM posts WHERE id = $1", [postId]);
            const usersDisliked = await client.query("SELECT usersDisliked FROM posts WHERE id = $1", [postId]);
            console.log("usersDisliked", usersDisliked.rows[0].usersdisliked)
            //Merge both arrays into one, but before that, check if one of them is null (sql returns null if array is empty).
            const mergedArrays = usersLiked.rows[0].usersliked === null ? usersDisliked.rows[0].usersdisliked 
            :usersDisliked.rows[0].usersdisliked === null ? usersLiked.rows[0].usersliked
            :usersLiked.rows[0].usersliked.concat(usersDisliked.rows[0].usersdisliked);
            console.log("mergedArrays", mergedArrays)
            //Check how many times name_surname is in the array.
            const name_surname_occurrences = mergedArrays.filter(name_surname => name_surname === name_surname_value).length;
            console.log(name_surname_occurrences)
            //name_surname can only be in one array.
            //Else, return an error.
            if (name_surname_occurrences > 1) return Promise.reject("User seems to have voted both ways, something went wrong");
            if (name_surname_occurrences === 0) return Promise.reject("Cannot unregister a vote if user hasn't voted yet")
            //Next line will decrement the vote count on the post and remove name_surname and userId from the corresponding arrays
            await usersLiked.rows[0].usersliked.includes(name_surname_value)
                ?await client.query("UPDATE posts SET likes = likes - 1, usersliked = array_remove(usersliked, $1), likersid = array_remove(likersid, $3) WHERE id = $2", [name_surname_value, postId, voter_id])
                :await client.query("UPDATE posts SET dislikes = dislikes - 1, usersDisliked = array_remove(usersDisliked, $1), dislikersid = array_remove(dislikersid, $3) WHERE id = $2", [name_surname_value, postId, voter_id]);
            return           
        }

module.exports = {consoleLogTest, deleteOutdatedLocalPicture, handleFilesBeforeModify, sendPosts, makePost, sendPostCorrespondingToId, deletePost, modifyPost, likePost, createComment, deleteComment, modifyComment, getAllComments, getCommentsByPostId};
