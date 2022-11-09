import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Comments from './Comments';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartFull } from '@fortawesome/free-solid-svg-icons';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { faThumbsDown as faThumbsDownEmpty } from '@fortawesome/free-regular-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const PostPage = ({ handleLike, posts, handleDelete }) => { //Props are passed from App.js
    const { id } = useParams(); //id is the id of the post we want to display
    const post = posts.find(post => (post.id).toString() === id);//To use strict equality, we need to convert the id to a string.
    const userId = localStorage.getItem('userId');
    const [viewPortWidth, setViewPortWidth] = useState(window.innerWidth);


    useEffect(() => {
        const handleResize = () => setViewPortWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);





    return (
        <main className="PostPage">
            {post &&
                <article className="post_PostPage" style={{color: "inherit", textDecoration: "inherit"}}>
                    <>
                        <span className="AuthorNameAndDate">
                            <p><FontAwesomeIcon icon={faUser}/>
                            {post.author_name}</p>
                            {viewPortWidth > 1024 ? <p>le {new Date(post.post_date).toLocaleString()}</p> : <p>{new Date(post.post_date).toLocaleString('default', { month: 'long' })} {new Date(post.post_date).toLocaleString('default', { year: 'numeric' })}</p>}
                        </span>
                        <div className="postContent">
                            <p className="postDate">{post.datetime}</p>
                            <p className="postBody">{post.body}</p>
                            {post.shared_picture && <img className="postImage" src={post.shared_picture} alt = "post illustration"
                            />}
                        </div>
                        <div className="postInteractions">
                            <div className="like"
                            type="submit" onClick={(e) =>
                                handleLike(e, post.id, true, post.likersid)}>
                                {post.likes}
                                <div className="circle"></div>
                            {post.likersid && post.likersid.includes(userId) ? <FontAwesomeIcon icon={faHeartFull} className='redHeart'/> : <FontAwesomeIcon icon={faHeart} className='heart'/>}
                            </div>
                            <div className="dislike"
                            type="submit" onClick={
                                (e) =>
                                handleLike(e, post.id, false, post.dislikersid)}>
                                {post.dislikes}
                                <div className="circle"></div>
                                {post.dislikersid && post.dislikersid.includes(userId) ? <FontAwesomeIcon icon={faThumbsDown} className='redHeart'/> : <FontAwesomeIcon icon={faThumbsDownEmpty} className='heart'/>}
                            </div>
                            <Link to={`/modify/${post.id}`}>
                            <button className="postPageButton" type="submit" >
                                {viewPortWidth > 1024 ?  <p>Modify</p>  :<FontAwesomeIcon icon={faEdit} className='modifyIcon'/>}
                            </button>
                            </Link>
                            <button onClick={(e) => handleDelete(e, post.author_id, post.id)} className="postPageButton" type="submit" >
                                {viewPortWidth > 1024 ? <p>Delete</p> : <FontAwesomeIcon icon={faTrash} className='trashIcon'/> }
                            </button>
                        </div>
                    </>
                    <div className="postComments">
                        <h2>Comments</h2>
                        <Comments
                            post = {post}
                        
                        />
                    </div>
                    
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