//Using a react fragment, the Feed component returns a Post component for each post in the posts array.
import Post from "./Post";

const Feed = ({posts, handleDelete, handleModify, handleFileSelect, handleLike}) => {
    return (
        <>
            {posts.map((post) => (
                <Post key={post.id} post={post} handleDelete={handleDelete} handleModify={handleModify} handleFileSelect={handleFileSelect} handleLike={handleLike}/>
            ))}
        </>
    );
}

export default Feed;