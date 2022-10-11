import Header from './Header';
import Nav from './Nav';
import Footer from './Footer';
import Home from './Home';
import NewPost from './NewPost';
import PostPage from './PostPage';
import Missing from './Missing';
import ModifiedPost from './ModifyPost';

import AuthPage from '../AuthPage/AuthPage';

import { useState, useEffect } from 'react';
import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';


// import { format } from 'date-fns';

//Verify if user is logged in with token.
//Is it secure, or should I use cookies?

//If user is logged in, return the routes to the pages.
//If user is not logged in, return the routes to the login page.

function App () {
  //Posts and SetPosts are used to store the posts from the database.
  //We retrieve the posts from the database with axios, and store them in the Posts state.
  //We then map the Posts state to the PostPage component, which displays the posts.

  //The back have a middleware that checks if the user is logged in with a valid token.

  const token = localStorage.getItem('token');

  if (token === null || token === undefined  || token.toString === null || token.toString === undefined) {
    //User is not logged in. Return the login page.
    console.log ('User is not logged in');
    return (     
        <Routes>
          <Route path="/" element={<AuthPage />} />
          {/* If the user tries to access a page that doesn't exist, return the Missing component. */}
          <Route path="*" element={<Missing />} /> 
        </Routes>
    );

  } else {
    //Our user is logged in, so we return the routes to the pages.

    console.log ('User is logged in', token);

    //Declaring the states for the posts and search functions to use. They will be passed as props to the components.
    const [posts, setPosts] = useState([]);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [postBody, setPostBody] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const navigate = useNavigate();

    //Retrieve posts from the database and fill the posts state with the response data.
    useEffect(() => {
      axios.get('http://localhost:5000/api/post', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      .then(response => {
        console.log('response.data', response.data);
        setPosts(response.data);
        console.log('In useEffect, posts', response.data);
      })
      .catch(error => {
        console.log('Error retrieving posts', error, 'error.response', error.response);
        //If axios error is 403, the token is invalid. Remove the token and userId from local storage and redirect to login page.
        if (error.response.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          navigate('/');
        }
      });
    }, []);

    //Search function with filter method.
    useEffect(() => {
      console.log('In useEffect, search', search);
      const filteredResults = posts.filter(post =>
        ((post.body).toLowerCase()).includes(search.toLowerCase()) //toLowerCase() is used to make the search case insensitive (i.e. "Hello" and "hello" will both be found).
        );
      setSearchResults(filteredResults.reverse());//Reverse the array so that the most recent posts are displayed first.
    }, [posts, search]);

    //handleSubmit will send the post to the server, containing the post body and the image.
    const handleSubmit = (e) => {
      e.preventDefault();//Prevent default behaviour of the form. In this case, prevent the page from reloading.
      const formData = new FormData(); //Create a new FormData object.
        formData.append("image", selectedFile);
        formData.append("body", postBody);
        console.log(formData);
      try {
        axios.post('http://localhost:5000/api/post', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }).then((response) => {
          const newPost = response.data;
          setPosts([newPost, ...posts]); //Add the new post to the posts state. IF DOESN'T WORK, TAKE OUT THE PARANTHESES.
          console.log("In handleSubmit, response", response);
          console.log("response.data", response.data);
          //Empty the post body and the selected file to avoid the user re-submitting the same post by mistake.
          setPostBody('');
          setSelectedFile(null);
          const postId = response.data.id;
          console.log("postId", postId);
          navigate(`/post/${postId}`);//Redirect to post page.
        });
      } catch (err) {
        console.log(err);
      }
    };

    //Modify post function, it will send a put request to our API, with the id of the post displayed, to modify either the picture, the body, or both.
    const handleModify = (author_id, id) => {
      //Before sending the request to the server, we need to open a window where the user can modify the post.
      //We will use the ModifyPost component for that.
      console.log("In handleModify, author_id", author_id);
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("body", postBody);
      formData.append("author_id", author_id);
      formData.append("user_id", localStorage.getItem('userId'));
      console.log("In handleModify, formData user_id and author_id", formData.get('user_id'), formData.get('author_id'));
      try {
        axios.put(`http://localhost:5000/api/post/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
        }).then((response) => {
          setSelectedFile(null);//Empty the selectedFile to prevent the same image from being sent again.
          console.log("In handleModify, response", response);
          //Change the post in the posts state to the modified post.
          const modifiedPost = response.data;
          const newPosts = posts.map(post => {
            if (post.id === modifiedPost.id) {
              return modifiedPost;
            } else {
              return post;
            }
          });
          setPosts(newPosts);
          const postId = response.data.id;
          // Empty form fields to avoid sending the same data again.
          setPostBody('');
          setSelectedFile(null);
          navigate(`/post/${postId}`);//Redirect to post page.
        });
      } catch (err) {
        console.log(err);
      }
    };

    //Select file to upload.
    const handleFileSelect = (e) => {
      console.log('File selected');
      setSelectedFile(e.target.files[0]);
    };

    //Delete post function.
    const handleDelete = (author_id, postId) => {
      // Also send post.authorId to the server, so that the server can verify if the user is the author of the post.
      const userId = localStorage.getItem('userId');
      axios.delete(`http://localhost:5000/api/post/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: {
          author_id: author_id,
          user_id: userId
        }
      })
      .then(response => {
        console.log("In handleDelete, postId", postId);
        console.log("In handleDelete, response.data", response.data);
        const updatedPosts = posts.filter(post => post.id !== postId); //Filter out the post that was deleted.
        setPosts(updatedPosts);
        navigate('/');//Redirect to homepage.
      })
      .catch(error => {
        console.log(error);
      });
    };

    //Like post function.
    const handleLike = (id, boolean, postVoterIds) => {
      const voter_id = localStorage.getItem('userId');
      //if boolean is true, like is equal to 1, else it's equal to -1.
      let like = boolean ? 1 : -1;
      console.log('button clicked, voteType is', like, ' id is', id, ' boolean is', boolean);
      console.log('voter_id is', voter_id);
      //If the voter_id can be found in post.votersid, then like is equal to 0.
      //This is to prevent the user from liking a post twice.
      //Avoid cannot read property 'includes' of undefined error, or null.
      if (postVoterIds !== undefined && postVoterIds !== null && postVoterIds.includes(voter_id)) {
        like = 0;
      }
      console.log('in handlelike, Like is', like);
      voteRequest(id, like, voter_id);
    };
    //Vote request function.      
      function voteRequest(id, like, voter_id) {
        console.log('voteRequest called');
        axios.post(`http://localhost:5000/api/post/${id}/like`, {
          voter_id: voter_id,
          like: like
        }, {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        })
        .then(response => {
          console.log('In voterequest : response.data', response.data);
          const newPosts = posts.map(post => post.id === id ? response.data : post); 
          setPosts(newPosts);
        })
        .catch(error => {
          console.log(error);
        });
      }
      //Console.log all the elements to know in which order they are rendered.
      

    //Finally, return the routes to the pages.
    return (
        <div className="App">
          <div className="content">
          <div className="left-card">
            <Header title = "Groupomania"/>
            <Nav search={search} setSearch={setSearch} />
            <Footer/>
          </div>
            <Routes>

              <Route path="/" className="Home"
                element=
                  {<Home posts={searchResults}
                  setPosts={setPosts}
                  handleDelete={handleDelete}
                  handleLike={handleLike}
                  />}
              />
              
              <Route path="/newpost"
                element=
                  {<NewPost
                    postBody={postBody} setPostBody={setPostBody}
                    handleFileSelect={handleFileSelect}
                    handleSubmit={handleSubmit}
                  />}
              />

              <Route path="/modify/:id"
                element=
                  {<ModifiedPost
                    posts={posts}
                    postBody={postBody} setPostBody={setPostBody}
                    handleFileSelect={handleFileSelect}
                    handleModify={handleModify}
                  />}
              />
                
              <Route path="/post/:id" 
                element=
                  {<PostPage posts={posts}
                  handleLike={handleLike}
                  handleDelete={handleDelete} 
                  handleModify={handleModify}
                  />} 
              />

              <Route path="/post/:id/like"
                element=
                  {<PostPage posts={posts}
                  // handleLike={handleLike}
                  />}
              />
              
              <Route path="*" element={<Missing />} />

            </Routes>

          </div>
        </div>
    );
  }
}


export default App;