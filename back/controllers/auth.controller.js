require("dotenv").config();

const bcrypt = require("bcryptjs");
const client = require("../pgsql_db");
    //When the app will be deployed, we will need to use pool.query instead of client.query.
    //This is because we will have multiple users, and we will need to use the pool to handle the requests.
const jwt = require ("jsonwebtoken");

///////////////////
//Signup function//
///////////////////
async function saveNewUser(req, res) {
    try {
    const { email, password, name_surname} = req.body;
    const hashedPassword = await passwordHasher(password);//Storing user information with a hashed password.
    console.log(hashedPassword, email, password, name_surname);
    await client.query(`INSERT INTO users (email, password, name_surname) VALUES ('${email}', '${hashedPassword}', '${name_surname}')`);
    res.status(201).send({message: "User created"});
    } catch (err) {
        if (err.code === "23505") {
            return res.status(401).send({message: "User already exists"});
        }   
        console.log(err);
        res.status(409).send({message: "Error creating user: " + err})
    }
}

//////////////////
//Login function//
//////////////////
async function loginUser(req, res) {
    try {
    const { email, password } = req.body;
    //User pgsql query to find user with email.
    const user = await client.query(`SELECT * FROM users WHERE email = '${email}'`);
    const userId = user.rows[0].id;
    const isPasswordValid = await bcrypt.compare(password, user.rows[0].password);
    if (!isPasswordValid) {
        client.release
        return res.status(401).send({message: "Invalid credentials"});
    }
    const token = createToken(userId)
    client.release
    res.status(200).send({userId : userId, token : token})
    } catch (err) {
    client.release
    res.status(500).send({message: "Error logging in: " + err})
    }
}
//Making token out of current userId and our jwtPassword.
function createToken(userId) {
    const jwtPassword = process.env.JWT_PASSWORD;
    return jwt.sign({userId: userId}, jwtPassword, {expiresIn: "24h"}); //return token
}

//Function to encrypt password.
function passwordHasher(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds)
}

module.exports = {saveNewUser, loginUser};