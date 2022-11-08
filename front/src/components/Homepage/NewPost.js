import TextareaAutosize from 'react-textarea-autosize';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//Get file select icon
import { faFileImage } from '@fortawesome/free-solid-svg-icons';
const fileSelectIcon = <FontAwesomeIcon icon={faFileImage} />


const NewPost = (
    {postBody, setPostBody, handleSubmit, handleFileSelect}
) => {
    return (
        <main className="NewPost">
            {/* <h2>New Post</h2> */}
            <form className="newPostForm" onSubmit={handleSubmit}>
                <label htmlFor="newPostBody">Body</label>
                <TextareaAutosize 
                    placeholder='Write here.'
                    id="newPostBody"
                    className="newPostBody"
                    value={postBody}
                    onChange={(e) => setPostBody(e.target.value)}
                />
                <label htmlFor="handleFileSelect" className="imageLabel">
                    {fileSelectIcon} Select file
                </label>
                <input
                    id="handleFileSelect"
                    type="file"
                    onChange={handleFileSelect}
                />
                
                <button type="submit">Submit</button>
                <Link to="/">
                    <button type="submit">Back</button>
                </Link>
            </form>
        </main>
    )
}

export default NewPost