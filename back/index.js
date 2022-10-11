
const port = process.env.PORT || 5000;
const path = require('path');
const {app, express} = require("./server");
const {postRouter} = require("./routers/post.router");
const {authRouter} = require("./routers/auth.router");

//////////////////////
//Server test route://
app.get("/", (req, res) => {
    res.status(200).send("Engine Started, Ready to take off!");
})

///////////////
//Middleware://
app.use("/api/auth", authRouter)
app.use("/api/post", postRouter)

///////////
//Listen://
app.listen(port, () => {
    console.log(`Here we go, Engines started at ${port}.`);
})
//////////////////////////////////////////////////////
//Authorization to see images folder on back server://
app.use("/images", express.static(path.join(__dirname, "images")));
