require("dotenv").config();

const bcrypt = require("bcryptjs");
const client = require("../pgsql_db");
// Change to pool ? Client ? To see if it limits the duplicates console.log()
const jwt = require ("jsonwebtoken");

// pool.query vs client.query difference ?
// 

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








//////////////////////////////////////

//Registration
/*
exports.register = async(req, res) => {
    const {name, email, password} = req.body;
    try{
        const data = await client.query(`SELECT * FROM users WHERE email=$1;`, [email])
        const arr = data.rows;
        if (arr.length != 0) {
        return res.status(400).json({
            error : "Email already exist, no need to register again. Please login.",
        });
        }
        else {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err)
                res.status(err).json({
                    error: "Server error",
                });
                const user = {
                    name,
                    email,
                    password: hash,
                };
                var flag = 1; //Declaring a flag
                //flag which will act as boolean for the following section
                //inserting data into psql DB
                client.query(`INSERT INTO users (name, email, password) VALUES ($1,$2,$3);`, [user.name, user.email, user.password], (err) => {
                    if (err) {
                        flag = 0;//If user is not inserted to database, assigning 0/false to flag.
                        console.error(err);
                        return res.status(500).json({
                            error: "Database error"
                        })
                    }
                    else {
                        flag = 1;
                        res.status(200).send({message: "User added to database, not verified"});
                    }
                })
                if (flag){
                    const token = jwt.sign(
                        {email: user.email}, process.env.SECRET_KEY
                    )
                }
            })
        }
    }
    catch (err){
        console.log(err);
        res.status(500).json({
            error:"Database error while registering",
        })
    }
}

//Login function
exports.login = async (req, res) => {
    const {email, password } = req.body;
try{
    const data = await client.query(`SELECT * FROM users WHERE email=$1;`, [email]) //Checking existence of user in db
    const user = data.rows;
    if (user.length === 0) {
        res.status(400).json({
            error: "User is unknown, please sign up first.",
        });
    }
    else{
        bcrypt.compare(password, user[0].password), (err, result) =>{
            if (err) {
                res.status(500).json({
                    error: "Server error",
                });
            } else if (result === true) {
                const token = jwt.sign(
                    {
                        email: email,
                    },
                    process.env.SECRET_KEY
                );
                res.status(200).json({
                    message: "User signed in.",
                    token: token,
                });
            }
            else{
                if (result != true)
                res.status(400).json({
                    error:"Wrong password.",
                });
                }
                }
                }
                } catch (err) {
                console.log(err);
                res.status(500).json({
                error: "Database error occurred while signing in.", //Database connection error
                });
                };
            }*/