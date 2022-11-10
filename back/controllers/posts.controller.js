const client = require("../pgsql_db");
const jwt = require("jsonwebtoken");
const { unlink } = require("fs/promises");
const { request } = require("http");

//sendPosts will send all posts to display on the webpage.
function sendPosts(req, res){
    client.query("SELECT * FROM posts ORDER BY post_date ASC")//DESC = descending order, meaning the most recent post will be displayed first.
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
//If there is no file, proceed to next function.
    if (!ThereIsANewImage) return next();
    deleteOutdatedLocalPicture(req, res, next);
}
function deleteOutdatedLocalPicture(req, res, next){
//First, exclude any userId not matching the auth
    const author_id = req.body.author_id;
    const user_id = req.body.user_id;
//Check identity of user. If not authorized, delete the new file he may have uploaded, and send a 403 error.
    if (author_id != user_id && user_id != 55) {
            const file = req.file;//Getting the file from the request, if user is modifying a post.
            if (file) {
                const fileName = file.fileName;
                const filePath = `images/${fileName}`;
                unlink(filePath);
            }
            return res.status(403).send("You are not authorized to modify this post");    
    }
//The user is confirmed to be the author of the post, or the admin. Proceed to delete the old picture.
        client.query("SELECT shared_picture FROM posts WHERE id = $1", [req.params.id])
            .then((post) => {
                if (post.rows[0].shared_picture === null) return next();
                //If there is no picture, proceed to next function.
                const fileToDelete = post.rows[0].shared_picture.split("/").at(-1);
                return unlink("images/" + fileToDelete);
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
    return req.protocol + "://" + req.get("host") + "/images/" + fileName;
}

async function makePost(req, res){
//Making one post and saving it on our sql database.

    //checking if a file was provided by user. If not, proceed to create a post without an image, else create a post with an image.
    const {body} = req.body;
    //Make a string with body.

    //Decoding the token from the request header to get the user id.
    const header = req.header("Authorization"); //Making a const out of the authorization header of the request.
    const token = header.split(" ")[1]// Using it to select the token part of the header with split.
    const decodedToken = jwt.verify(token, process.env.JWT_PASSWORD);//Decoding the token with our dotenv password, and putting it into the const decodedToken.
    const userId = decodedToken.userId;//Selecting the userId part of the decodedToken.
    //Get value of name_surname column in users table, where id = userId, and assign it to the author_name variable.
    const author_name = await client.query("SELECT name_surname FROM users WHERE id = $1", [userId])

    
    //Checking if a file was provided by user. If not, proceed to create a post without an image, else create a post with an image.
    const ThereIsANewImage = req.file != null;

    if (!ThereIsANewImage){
        //The query will return the row that was created.
                client.query("INSERT INTO posts (body, author_id, likes, dislikes, author_name) VALUES ($1, $2, $3, $4, $5) RETURNING *", [body, userId, 0, 0, author_name.rows[0].name_surname])
                    .then((post) => res.status(200).send(post.rows[0]))
                    .catch((err) => res.status(500).send(err));
    } else {
        //We will use the file property of the request to get the file.
        const file = req.file;
        //Using the createImageUrl function to get the new imageUrl from the request fileName.
        const imageUrl = createImageUrl(req, file.fileName);
        //The query will return the row that was created.
        client.query("INSERT INTO posts (body, author_id, shared_picture, likes, dislikes, author_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [body, userId, imageUrl, 0, 0, author_name.rows[0].name_surname])
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
    const rootCommentId = req.params.rootId;//Request params are 
//First, we treat the case where the user is commenting on a post.
    if (commentId == null){
        //Case where the user is commenting on a post. parent_id is the id of the post.
        client.query("INSERT INTO comments (body, author_id, parent_id, post_id) VALUES ($1, $2, $3, $4) RETURNING *", [req.body.body, userId, req.params.id, req.params.id]) 
            .then((comment) => res.status(200).send(comment.rows[0]))
            .catch((err) => res.status(500).send(err));
        return
    }
//rootId is the id of the oldest comment in the chain, which is directly linked to the post. It is the same for all comments in the chain.
    if (rootCommentId == 0){
        //Case where the user is commenting on a root comment. parent_id is the id of the root comment. root_id is the id of the root comment.
        client.query("INSERT INTO comments (body, author_id, parent_id, post_id, root_comment_id) VALUES ($1, $2, $3, $4, $5) RETURNING *", [req.body.body, userId, commentId, req.params.id, commentId])
            .then((comment) => res.status(200).send(comment.rows[0]))
            .catch((err) => res.status(500).send(err));
        return
    }
//Last case, where the user is commenting on a comment that is not a root comment. parent_id is the id of this comment. root_id is the id of the root comment.
    if (commentId != 0){
        client.query("INSERT INTO comments (body, author_id, parent_id, post_id, root_comment_id) VALUES ($1, $2, $3, $4, $5) RETURNING *", [req.body.body, userId, commentId, req.params.id, rootCommentId])
            .then((comment) => res.status(200).send(comment.rows[0]))
            .catch((err) => res.status(500).send(err));
        return
    }
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

//Display all comments no matter what the parent_id is, to ease moderation.
function getAllComments(req, res){
    //Getting all the comments from the database, ordered by comment_date.
    //We need to avoid error 22P02 (invalid input syntax for integer).
    client.query("SELECT * FROM comments")
        .then((comments) => res.status(200).send(comments.rows))
        .then((comment) => console.log("comment", comment))
        .catch((err) => res.status(500).send(console.log("err", err)));
}


//Send all comments from a specific post.
 function getCommentsByPostId(req, res){
    const postId = req.params.id;
    const limit = req.query.limit;
    const offset = req.query.offset;
    //ASC is for ascending order, DESC is for descending order.
    client.query("SELECT * FROM comments WHERE post_id = $1 ORDER BY comment_date ASC", [postId])
        .then((comments) => res.status(200).send(comments.rows))
        .catch((err) => res.status(500).send(err));
}

//Get all root comments from a specific post.
function getRootCommentsByPostId(req, res){
    const postId = req.params.id;
    const page = req.query.page;
    const limit = 3;
    const offset = (page - 1) * limit; //We need to calculate the offset to get the right comments. Page 1 will have an offset of 0, page 2 will have an offset of 5, etc.

    //Using the limit and offset to get the comments we want.
    //root_comment_id is 0 when the comment is a root comment.
    client.query("SELECT * FROM comments WHERE post_id = $1 AND root_comment_id = 0 ORDER BY comment_date ASC LIMIT $2 OFFSET $3", [postId, limit, offset])
        .then((comments) => res.status(200).send(comments.rows))
        .catch((err) => res.status(500).send(err));
}
//Get child comments corresponding to a specific root comment.
function getChildCommentsByRootCommentId(req, res){
//Root comment id is the id of the comment we want to get all levels of child comments from.
//This function will be called for each root comment in the frontend, to get all the child comments.
    const post_id = req.params.id;
    const rootCommentId = req.params.rootId;

    const page = req.query.page;
    const limit = 3;
    const offset = (page - 1) * limit;
    
    //Using limit and offset to paginate the results.
    client.query("SELECT * FROM comments WHERE post_id = $1 AND root_comment_id = $2 ORDER BY comment_date ASC LIMIT $3 OFFSET $4", [post_id, rootCommentId, limit, offset])
        //If the query is successful, we send the result.
        //If not, we tell the user there is no child comment.
        .then((comments) => res.status(200).send(comments.rows))
        .catch((err) => res.status(500).send(err));
}


    
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//LIKES & DISLIKES FUNCTIONS///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function likePost (req, res) {
    const {like, voter_id} = req.body;
    const postId = req.params.id;
    if (![0, -1, 1].includes(like)) return res.status(403).send({message : "Like request is invalid : incorrect value"}); //Bad values are immediately rejected.
    //Do a query with a if statement to check if query result is null.
    const selectedPost = await client.query("SELECT * FROM posts WHERE id = $1", [postId]);
    if (selectedPost.rows[0] === undefined) return res.status(404).send({message : "Post not found"}); //If the post doesn't exist, return a 404 error.
    
    try {
        await updateVoteCounter(like, voter_id, postId)
        const updatedPost = await client.query("SELECT * FROM posts WHERE id = $1", [postId]);
        return res.status(200).send(updatedPost.rows[0]);
    }
    catch (err) {
        res.status(500).send(err)
    }
}
    function updateVoteCounter(like, voter_id, postId){
        if (like === 1 || like === -1) return incrementVote(postId, voter_id, like)
        return setVoteToZero(postId, voter_id)
    }
        async function getNameSurname(voter_id) {//Get name_surname value from users table.
            const nameSurname = await client.query("SELECT name_surname FROM users WHERE id = $1", [voter_id]);
            return nameSurname.rows[0].name_surname
        }
        //Increment the vote count on the post and add name_surname to the corresponding voter array.
        async function incrementVote(postId, voter_id, like){
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
            const name_surname_value = await getNameSurname(voter_id)
            //Check all occurrences of name_surname for current user in usersLiked and usersDisliked arrays.
            const usersLiked = await client.query("SELECT usersLiked FROM posts WHERE id = $1", [postId]);
            const usersDisliked = await client.query("SELECT usersDisliked FROM posts WHERE id = $1", [postId]);
            //Merge both arrays into one, but before that, check if one of them is null (sql returns null if array is empty).
            const mergedArrays = usersLiked.rows[0].usersliked === null ? usersDisliked.rows[0].usersdisliked 
            :usersDisliked.rows[0].usersdisliked === null ? usersLiked.rows[0].usersliked
            :usersLiked.rows[0].usersliked.concat(usersDisliked.rows[0].usersdisliked);
            //Check how many times name_surname is in the array.
            const name_surname_occurrences = mergedArrays.filter(name_surname => name_surname === name_surname_value).length;
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

module.exports = {deleteOutdatedLocalPicture, handleFilesBeforeModify, sendPosts, makePost, sendPostCorrespondingToId, deletePost, modifyPost, likePost, createComment, deleteComment, modifyComment, getAllComments, getCommentsByPostId, getRootCommentsByPostId, getChildCommentsByRootCommentId};
