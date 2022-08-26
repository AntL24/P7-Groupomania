const express = require("express");
const authRouter = express.Router();
const {saveNewUser, loginUser} = require("../controllers/auth.controller");

authRouter.post('/register', saveNewUser);//Post request for registration
authRouter.post('/login', loginUser);//Post request for login

module.exports = {authRouter} 