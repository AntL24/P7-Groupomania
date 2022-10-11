//ModifyPost component is used to modify a post.
//It is a child of App component.
//It will be rendered when the user clicks on the "Modify" button on the PostPage component.

//Id of the post to modify was passed as a parameter.
//We need to get it from the url.
//We will use the useParams hook from react-router-dom.
import { useParams, Link } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';

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
                            <p className="postDate">{post.datetime}</p>
                            <p className="postBody">{post.body}</p>
                            {post.shared_picture && <img className="postImage" src={post.shared_picture} alt = "post illustration" />}
                        </div>
                        <form className="modifyForm" onSubmit={(e) => {
                            e.preventDefault();
                            handleModify(post.author_id, post.id);
                        }}>
                            <label htmlFor="body">Modifier le texte</label>
                            <TextareaAutosize 
                                placeholder='Modifier le texte'
                                id="body"
                                name="body"
                                value={postBody}
                                onChange={(e) => setPostBody(e.target.value)}
                            />
                            <label htmlFor="image">Modifier l'image</label>
                            <input
                                type="file"
                                id="image"
                                name="image"
                                accept="image/png, image/jpeg"
                                onChange={handleFileSelect}
                            />
                            <button type="submit">Modifier</button>
                        </form>
                        <Link to={`/post/${post.id}`}>
                            <button className="modifyButton" type="submit" >
                                Retour au post
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

