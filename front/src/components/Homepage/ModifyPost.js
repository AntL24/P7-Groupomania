//Id of the post to modify was passed as a parameter. //We need to get it from the url using the useParams hook from react-router-dom.
import { useParams, Link } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//Get file select icon
import { faFileImage } from '@fortawesome/free-solid-svg-icons';
const fileSelectIcon = <FontAwesomeIcon icon={faFileImage} />

    const ModifiedPost = ({posts, postBody, setPostBody, handleFileSelect, handleModify}) => {
    const { id } = useParams();
    const post = posts.find((post) => (post.id).toString() === id);
    //To use strict equality, we need to convert the id to a string.

    return (
        <main className="PostPage">
                {post &&
                <>
                    <h2>Post to update:</h2>
                    <article className="post">
                        <div className="postContentModify">
                            <p className="postBody">{post.body}</p>
                            {post.shared_picture && <img className="postImage" src={post.shared_picture} alt = "post illustration" />}
                        </div>
                        <form className="modifyForm" onSubmit={(e) => {
                            e.preventDefault();
                            handleModify(post.author_id, post.id);
                        }}>
                            <label htmlFor="body" className="modifyLabel">Modify your post:</label>
                            <TextareaAutosize 
                                placeholder='Modifier le texte'
                                id="newPostBody"
                                className="newPostBody"
                                value={postBody}
                                onChange={(e) => setPostBody(e.target.value)}
                            />
                            <label htmlFor="handleFileSelect" className="imageLabel">
                                {fileSelectIcon} Select file
                            </label>
                            <input
                                type="file"
                                id="handleFileSelect"
                                name="image"
                                onChange={handleFileSelect}
                            />
                            <button className="modifyButton" type="submit">Send modifications</button>
                        </form>
                        <Link to={`/post/${post.id}`}>
                            <button className="returnButton" type="submit" >
                                Go back to post
                            </button>
                        </Link>
                    </article>

                </>
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

export default ModifiedPost;

