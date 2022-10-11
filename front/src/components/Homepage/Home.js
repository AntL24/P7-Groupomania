import Feed from "./Feed";

const Home = ({posts, handleDelete, handleModify, handleFileSelect, handleLike}) => {
    return (
        <main className="Home">

            {posts.length ? (
                <Feed posts={posts} handleDelete={handleDelete} handleModify={handleModify} handleFileSelect={handleFileSelect} handleLike={handleLike}/>
                // Vérifier si en supprimant les props ici et ailleurs, ça fonctionne toujours (puisqu'ils se trouvent déjà dans app.js)
            ) : (
                <p style = {{textAlign: "center"}}>No posts to display</p> //If there are no posts, we display a message.
            )}
        </main>
    );
};

export default Home;