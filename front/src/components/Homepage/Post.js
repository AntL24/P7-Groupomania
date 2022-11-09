import { Link } from 'react-router-dom';
//Use state to change the color of the heart when clicked
import React, { useState, useEffect } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartFull } from '@fortawesome/free-solid-svg-icons';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { faThumbsDown as faThumbsDownEmpty } from '@fortawesome/free-regular-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const Post = ({ post, handleLike, handleDelete }) => {

    //Set state for heart color
    const likes = post.likes;
    const dislikes = post.dislikes;
    const userId = localStorage.getItem('userId');
    const [viewPortWidth, setViewPortWidth] = useState(window.innerWidth);
    const formatedPost_hour = new Date(post.post_date).toLocaleString();
    //Shorten the post date to display on mobile : display only how many days/weeks/month/years ago the post was created.
    const post_date = new Date(post.post_date);
    const today = new Date();
    const timeDiff = Math.abs(today.getTime() - post_date.getTime());
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));//
    const diffWeeks = Math.ceil(timeDiff / (1000 * 3600 * 24 * 7));
    const diffMonths = Math.ceil(timeDiff / (1000 * 3600 * 24 * 30));
    const diffYears = Math.ceil(timeDiff / (1000 * 3600 * 24 * 365));
    //Use the diffDays to display the post date on mobile.

    useEffect(() => {
        const handleResize = () => setViewPortWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

   
    return (

        <article className="post">
            <Link to={`/post/${post.id}`} style={{color: "inherit", textDecoration: "inherit"}}>
                <div className="post__container">
                    <span className="AuthorNameAndDate">
                        <p><FontAwesomeIcon icon={faUser}/>
                        {post.author_name}</p>
                        {viewPortWidth > 1024 ? <p>le {formatedPost_hour}</p> : <p>{diffDays < 7 ? diffDays + " jours" : diffWeeks < 4 ? diffWeeks + " sem." : diffMonths < 12 ? diffMonths + " mois" : diffYears + " ans"}</p>}
                    </span>
                
                    <div className="postContent">
                            <p className="postBody">{
                                (post.body).length <= 500
                                    ? post.body//If the post is less than 500 characters long, we display the whole post.
                                    : (post.body).slice(0, 500) + "..." //If the post is more than 500 characters long, we display the first 500 characters and add "...".
                            }</p>
                            {post.shared_picture && <img className="postImage" src={post.shared_picture} alt = "post illustration"/>}
                    </div> 
                </div>
            </Link>
            <div className="postInteractions">
                {/* On click, we pass post.id and a true value to the handleLike function */}
                <div className="like"
                    type="submit" onClick={(e) =>
                        handleLike(e, post.id, true, post.likersid)}>
                    {likes}
                    <div className="circle"></div>
                    {post.likersid && post.likersid.includes(userId) ? <FontAwesomeIcon icon={faHeartFull} className='redHeart'/> : <FontAwesomeIcon icon={faHeart} className='heart'/>}
                </div>
                <div className="dislike"
                    type="submit" onClick={
                        (e) =>
                        handleLike(e, post.id, false, post.dislikersid)}>
                        {dislikes}
                        <div className="circle"></div>
                        {post.dislikersid && post.dislikersid.includes(userId) ? <FontAwesomeIcon icon={faThumbsDown} className='redHeart'/> : <FontAwesomeIcon icon={faThumbsDownEmpty} className='heart'/>}
                </div>
                <Link to={`/modify/${post.id}`}>
                    <button className="modifyButton" type="submit" >
                    {viewPortWidth > 1024 ?  <p>Modify</p>  :<FontAwesomeIcon icon={faEdit} className='modifyIcon'/>}
                    </button>
                </Link>
                <button onClick={(e) => handleDelete(e, post.author_id, post.id)} className="deleteButton" type="submit" >
                    {viewPortWidth > 1024 ? <p>Delete</p> : <FontAwesomeIcon icon={faTrash} className='trashIcon'/> }
                </button>
            </div>
        </article>
    );
};

export default Post;