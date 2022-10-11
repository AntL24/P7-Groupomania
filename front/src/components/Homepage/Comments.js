import HandleReply from './HandleReply';
// import useFetch from '../hooks/UseFetch';
import InfiniteScroll from 'react-infinite-scroller';
import axios from 'axios';


import React, {useState, useEffect, useRef, useCallback} from 'react';
import {useParams} from 'react-router-dom';

function Comments({post}) {
    // function Comments is made of several functions that together will collect and send the comments in a nested manner, using parent_id to differenciate between childs and parents.
    const {id} = useParams();
    const token = localStorage.getItem('token');
    const [comments, setComments] = useState([]);
    
    const fetchData = useCallback(() => {
        axios.get(`http://localhost:5000/api/post/${id}/comments/`, {
            // params: {
            //     cursor: cursor,
            //     limit : 10
            // },
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            console.log(response.data);
            setComments(prevComments => {
                return [...new Set([...prevComments, ...response.data])]
            });
            // console.log("id to be added to cursor", response.data[response.data.length - 1].id);
            // setCursor(response.data[response.data.length - 1].id);
            // console.log("cursor", cursor);
            // setHasMore(response.data.length > 0);
            // setLoading(false);
        })
        .catch(e => {
            console.log(e);
        //     if (axios.isCancel(e)) return
        //     setError(true)
        })
    }
    , [token, id]);

    useEffect(() => {
        fetchData();
    }
    , [fetchData]);

    return (
        <div className="comments">
         {comments.map((comment) => (
            <div className="comment" key={comment.id}>
                <div className="comment__header">
                    {/* <div className="comment__header__user">
                        <img className="comment__header__user__avatar" src={comment.user.avatar} alt={comment.user.username} />
                        <p className="comment__header__user__username">{comment.user.username}</p>
                    </div> */}
                    <p className="comment__header__date">{comment.comment_date}</p>
                </div>
                <p className="comment__content">{comment.body}</p>
                <HandleReply post={post} comment={comment} />
            </div>
        ))}
        </div>
    )
}

export default Comments
//Ci-dessous fonctionne (mais commentaires en double), donc le conserver 

// function Comments({post}){
//     const {id} = useParams();//Id of post.
//     const token = localStorage.getItem('token');
//     const [comments, setComments] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(false);
//     const [hasMore, setHasMore] = useState(false);
//     // Cursior by default is null.
//     const [cursor, setCursor] = useState();

//     //Retrieve comments from the database and fill the comments state with the response data.
//     //fetchData is called when the page loads, and when the user scrolls down. So wo need to ensure it will not be called if we already received all the comments.
    
//     // Instead of useEffect, we use callBack for fetchData
//     const fetchData = useCallback(() => {
//         setLoading(true);
//         setError(false);
//         let cancel; //This is used to cancel the request if the user scrolls down before the request is completed.
//         axios.get(`http://localhost:5000/api/post/${id}/comments/`, {
            
//             params: {
//                 cursor: cursor,
//                 limit : 10
//             },
//             headers: {
//                 'Authorization': 'Bearer ' + token
//             }
//         })
//         .then(response => {
//             console.log(response.data);
//             //We need to update the comments state with the new comments we received.
//             //We will use the spread operator to add the new comments to the comments state.
//             setComments(prevComments => {
//                 return [...new Set([...prevComments, ...response.data])]
//             });
//             //We need to update the cursor state with the id of the last comment we received.
//             console.log("id to be added to cursor", response.data[response.data.length - 1].id);
//             setCursor(response.data[response.data.length - 1].id);
//             console.log("cursor", cursor);
//             //If the response data length is less than 10, it means we received all the comments.
//             //So we will set the hasMore state to false.
//             if(response.data.length < 10){
//                 setHasMore(false);
//             }
//             setLoading(false);
//         })
//         .catch(error => {
//             if(axios.isCancel(error)) return; //If the request is cancelled, we will return.
//             setError(true);
//         });
//         return () => cancel();
//     }
//     , [cursor]);

//     //We need to use the useEffect hook to call fetchData when the page loads.
//     useEffect(() => {
//         fetchData();
//     }, []);
            
    
//     const observer = useRef();
//     const lastCommentElementRef = useCallback(node => {
//         if(loading) return;
//         if(observer.current) observer.current.disconnect();
//         observer.current = new IntersectionObserver(entries => {
//             if(entries[0].isIntersecting && hasMore){
//                 fetchData();
//             }
//         });
//         if(node) observer.current.observe(node);
//     }, [loading, hasMore]);

//     //Avoid duplicates keys
//     const uniqueComments = [...new Set(comments)];
//     return (
//         <div className="comments">
//             <h2>Comments</h2>
//             <InfiniteScroll

//                 pageStart={0}
//                 loadMore={fetchData}
//                 hasMore={hasMore}
//                 loader={<div className="loader" key={0}>Loading ...</div>}
//             >
//                 {uniqueComments.map((comment, index) => {
//                     if(uniqueComments.length === index + 1){
//                         return (
//                             <div className="comment" key={comment.id} ref={lastCommentElementRef}>
//                                 <div className="comment-header">
//                                     {/* <img src={comment.user.profile_picture} alt="" /> */}
//                                     <div className="comment-info">
//                                         {/* <h4>{comment.user.username}</h4> */}
//                                         <p>{comment.body}</p>
//                                     </div>
//                                 </div>
//                                 <div className="comment-footer">
//                                     {/* <p>{comment.created_at}</p> */}
//                                     <HandleReply comment={comment} setComments={setComments} comments={comments} />
//                                 </div>
//                             </div>
//                         );
//                     }else{
//                         return (
//                             <div className="comment" key={comment.id}>
//                                 <div className="comment-header">
//                                     {/* <img src={comment.user.profile_picture} alt="" /> */}
//                                     <div className="comment-info">
//                                         {/* <h4>{comment.user.username}</h4> */}
//                                         <p>{comment.body}</p>
//                                     </div>
//                                 </div>
//                                 <div className="comment-footer">
//                                     {/* <p>{comment.created_at}</p> */}
//                                     <HandleReply comment={comment} setComments={setComments} comments={comments} />
//                                 </div>
//                             </div>
//                         );
//                     }
//                 }
//                 )}
//             </InfiniteScroll>
//         </div>
//     );
// }

// export default Comments;