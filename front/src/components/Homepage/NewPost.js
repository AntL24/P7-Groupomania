const NewPost = (
    {postBody, setPostBody, handleSubmit, handleFileSelect}
) => {
    return (
        <main className="NewPost">
            <h2>New Post</h2>
            <form className="newPostForm" onSubmit={handleSubmit}>
                <label htmlFor="postBody">Body</label>
                <textarea
                    id="postBody"
                    required
                    value={postBody}
                    onChange={(e) => setPostBody(e.target.value)}                   
                />
                <label htmlFor="handleFileSelect">Image</label>
                <input
                    id="handleFileSelect"
                    type="file"
                    onChange={handleFileSelect}
                />
                
                <button type="submit">Submit</button>
            </form>
        </main>
    )
}

export default NewPost