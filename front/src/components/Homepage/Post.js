import { Link } from 'react-router-dom';
// import votes from './PostInteractions/LikeFunction.js';
// import comments from './PostInteractions/AddComment.js';


const Post = ({ post, handleLike, handleDelete }) => {
    const usersdisliked = post.usersdisliked;
    const usersliked = post.usersliked;
    const likes = post.likes;
    const dislikes = post.dislikes;
    return (
        <article className="post">
            <Link to={`/post/${post.id}`}>
                {post.shared_picture && <img className="postImage" src={post.shared_picture} alt = "post illustration" />}
                <button onClick={() => handleDelete(post.author_id, post.id)}>
                    Delete
                </button>
            </Link>
            <p className="postBody">{
            (post.body).length <= 25
                ? post.body//If the post is less than 25 characters long, we display the whole post.
                : (post.body).slice(0, 25) + "..." //If the post is more than 25 characters long, we display the first 25 characters and add "...".
            }</p>

            <Link to={`/modify/${post.id}`}>
                <button className="modifyButton" type="submit" >
                    Modify
                </button>
            </Link>
            {/* <Link to={`/post/${post.id}/like`}> */}
                {/* On click, we pass post.id and a true value to the handleLike function */}
                <button className="like" type="submit" onClick={() => handleLike(post.id, true, post.likersid)}>
                    {/* The number of likes and the voter_id can be found in post.likes and post.usersliked*/}
                    {likes}
                    <div className="usersDisliked">{usersliked}</div>
                </button>
                <button className="dislike" type="submit" onClick={() => handleLike(post.id, false, post.dislikersid)}>
                    {/* The number of dislikes and the voter_id can be found in post.dislikes and post.usersdisliked*/}
                    {dislikes}
                    <div className="usersDisliked">{usersdisliked}</div>
                </button>
            {/* </Link> */}
        </article>
    );
};


//Slice vs substring ? Same thing, but substring is not supported by IE.
//https://stackoverflow.com/questions/2243824/what-is-the-difference-between-string-slice-and-string-substring

export default Post;