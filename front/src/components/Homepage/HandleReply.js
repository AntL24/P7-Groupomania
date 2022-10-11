//Component used in Comment.js to reply to a comment.

import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const HandleReply = ({comment, setComments, comments}) => {
    const [replyBody, setReplyBody] = useState('');
    const token = localStorage.getItem('token');
    const { id } = useParams();
    console.log("commentid", comment.id);
    //HandleReply is used to post a reply to the database.
    const handleReply = (e) => {
        e.preventDefault();
        axios.post(`http://localhost:5000/api/post/${id}/comments/${comment.id}/`, {
            body: replyBody
        }, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            console.log(response.data);
            //Let's use object destructuring to update the comments array.
            setComments([...comments, response.data]);
            setReplyBody('');
        })
        .catch(error => {
            console.log(error);
        });
    }
    //We return a form to reply to a comment.
    return (
        <div className="reply">
            <form onSubmit={handleReply}>
                <input type="text" value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder="Write a reply..." />
                <button type="submit">Reply</button>
            </form>
        </div>
    );
}

export default HandleReply;