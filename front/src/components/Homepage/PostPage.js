import { useParams, Link } from 'react-router-dom';
import Comments from './Comments';


const PostPage = ({ handleLike, posts, handleDelete }) => { //Props are passed from App.js
    const { id } = useParams(); //id is the id of the post we want to display
    const post = posts.find(post => (post.id).toString() === id);//To use strict equality, we need to convert the id to a string.
    console.log('handleLike in PostPage is', handleLike);
    return (
        <main className="PostPage">
            {post &&
            <article className="post">
                <>
                    <div className="postContent">
                        <h2>{post.title}</h2>
                        <p className="postDate">{post.datetime}</p>
                        <p className="postBody">{post.body}</p>
                        {post.shared_picture && <img className="postImage" src={post.shared_picture} alt = "post illustration" />}
                    </div>

                    <div className="postTools">
                        <button onClick={() => handleDelete(post.author_id, post.id)}>
                            Delete post
                        </button>
                        <Link to={`/modify/${post.id}`}>
                            <button className="modifyButton" type="submit" >
                                Modify post
                            </button>
                        </Link>
                        {/* <Link to={`/post/${post.id}/like`}> */}
                            {/* To know which button the user clicked, we need to pass a boolean value to the handleLike function. True for like, false for dislike. */}
                            <button className="like" type="submit" onClick={() => handleLike(post.id, true, post.likersid)}>
                                {post.likes}
                                <div className="usersLiked">{post.usersliked}</div>
                            </button>
                            <button className="dislike" type="submit" onClick={() => handleLike(post.id, false, post.dislikersid )}>
                                {post.dislikes}
                                <div className="usersDisliked">{post.usersdisliked}</div>
                            </button>
                        {/* </Link> */}
                    </div>
                    <div className="postInteractions">
                            <h2>Comments</h2>
                            <Comments
                                post = {post}
                            />
                    </div>
                </>
            </article>
            }
            {!post &&
            <article className="post">
                <>
                    <h2>Post introuvable</h2>
                    <p>Quel dommage !</p>
                    <p>
                        <Link to="/">Retour à l'accueil</Link>
                    </p>
                </>
            </article>
            }
        </main>
    );
};

export default PostPage;