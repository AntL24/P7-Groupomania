import axios from 'axios';
//Import comments.scss from styles folder

import React, {useState, useEffect, useCallback} from 'react';
import {useParams} from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const Comments = ({ }) => {
 
    const token = localStorage.getItem('token');
    const { id } = useParams();
    
    const [rootComments, setRootComments] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [replies, setReplies] = useState([]);
    //Use map to store replies page number, but start at page 1
    const [repliesPage, setRepliesPage] = useState(new Map());
    const [repliesHasMore, setRepliesHasMore] = useState(new Map());//Use map to store replies hasMore boolean, but start at true


//API call for root comments
    const getRootComments = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/post/${id}/comments/rootComments/?page=${page}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setRootComments([...rootComments, ...response.data]);
            //For each root comment, set replies page number to 1. This will be used to load more replies for each root comment.
            response.data.forEach(comment => {
                repliesPage.set(comment.id, 1);
                repliesHasMore.set(comment.id, true);
            });
            if (response.data.length < 3) {
                setHasMore(false);
            }
        } catch (error) {
            console.log(error);
        }
    }, [page, rootComments, id, token]);

//API call for replies
    const getReplies = useCallback(async (rootId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/post/${id}/comments/rootComments/${rootId}/?page=${repliesPage.get(rootId)}`, { //repliesPage.get(rootId) is the page number for the rootId
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            //If the response is empty, it means there are no more replies to load
            if (response.data.length === 0) {
                setRepliesHasMore(repliesHasMore.set(rootId, false));
                return;
            }
            if (response.data.length < 3) {
                setRepliesHasMore(repliesHasMore.set(rootId, false));
            }
            //If the response is not empty, we add the replies to the state array : also prevent duplicates by checking if the reply is already in the array
            setReplies(replies => {
                const newReplies = [...replies];
                response.data.forEach(reply => {
                    if (!newReplies.some(r => r.id === reply.id)) {//If the reply is not already in the array, add it
                        newReplies.push(reply);
                    }
                });
                return newReplies;
            });
            //Increment the page number for the rootId
            setRepliesPage(repliesPage.set(rootId, repliesPage.get(rootId) + 1));
        } catch (error) {
            console.log(error);
        }
    }, [id, token, repliesPage, repliesHasMore]);

//Comment on post
    const handleComment = (e) => {
        e.preventDefault();
        axios.post(`http://localhost:5000/api/post/${id}/comments/`, {
            body : e.target.comment.value
        }, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
            .then(response => {
                setRootComments([response.data, ...rootComments]);
            })
            .catch(error => {
                console.log(error);
            })
    }
//Answer to a comment. Pass in params the rootId of the comment you are replying to. If the comment you are replying to is a root comment, then the rootId is equal to the comment id. 
    const handleReply = (e) => {
        e.preventDefault();
        console.log("replying to comment. comment id: " + e.target.commentId.value, "root id: " + e.target.rootId.value);
        axios.post(`http://localhost:5000/api/post/${id}/comments/${e.target.commentId.value}/${e.target.rootId.value}`, {
            body : e.target.reply.value
        }, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
            .then(response => {
                setReplies([response.data, ...replies]);
            })
            .catch(error => {
                console.log(error);
            })
    }

    //On first page load, we load the first page of comments, and the first page of replies for each root comment.
    useEffect(() => {
        getRootComments();
    }, [page]);

    //Use getReplies as dependency for useEffect
    useEffect(() => {
        rootComments.forEach(comment => {
            getReplies(comment.id);
        });
    }, [getReplies]);

    
    function setChildrenArray(comment, replies) {
        //Add an array of children to each comment
        comment.children = [];
        //Add the replies to the children array. Prevent duplicates by checking if the reply is already in the array.
        replies.forEach(reply => {
            if (reply.parent_id === comment.id && !comment.children.includes(reply)) {//If the reply is a reply to the comment, and the reply is not already in the children array
                comment.children.push(reply);
            }
        });
        //If the comment has children, we call setChildrenArray for each child
        if (comment.children.length > 0) {
            comment.children.forEach(child => {
                setChildrenArray(child, replies);
            });
        }
    }

    //Set the children array for each root comment
    rootComments.forEach(comment => {
        setChildrenArray(comment, replies);
    });

    //Recursive function to display comments and replies
    function Comment({comment, replies}) {
        const nestedComments = (comment.children || []).map(child => {
            //Also add the option to reply to a reply
            return <Comment comment={child} replies={replies} key={child.id} />
        });
        return (
            <div className="comment">
                <div className="comment__body">
                    <p>{comment.body}</p>
                    <div className="comment__reply">
                        <form onSubmit={handleReply}>
                            <input type="text" name="reply" placeholder="Reply to comment" />
                            <input type="hidden" name="commentId" value={comment.id} />
                            <input type="hidden" name="rootId" value={comment.root_comment_id} />
                            <button type="submit" className="comment__reply__button">
                                <p>Reply</p>
                            </button>
                        </form>
                    </div>
                </div>
                <div className="comment__replies">
                    {nestedComments}
                    {repliesHasMore.get(comment.id) && <button onClick={() => getReplies(comment.id)} className="comment__replies__button">Load more replies</button>}
                </div>
            </div>
        )
    }
//Display the comments
    return (
        <div className="comments">
            <div className="comments__form">
                <form onSubmit={handleComment}>
                    <TextareaAutosize name="comment" placeholder="Comment on post" className="comments__form__textarea" />
                    <div className="comments__form__buttons">
                        {window.innerWidth < 1024 ? <button type="submit" className='comments__form__button'><FontAwesomeIcon icon={faPaperPlane} /></button> : <button type="submit" className='comments__form__button'>Comment</button>}
                    </div >
                </form>
            </div>
            <div className="comments__list">
                {rootComments.map((comment) => {
                    return (
                        <Comment comment={comment} replies={replies} key={comment.id} />
                    )
                })}
            </div>
            <div className="comments__load-more">
                {hasMore && <button onClick={() => setPage(page + 1)}>Load more</button>}
            </div>
        </div>
    )
}

export default Comments;