require("dotenv").config();

const {Client}  = require("pg");

const client = new Client({
     database: process.env.DATABASE_NAME,
     host: process.env.DATABASE_HOST,
     port: 5432,
     username: process.env.DATABASE_USER,
     password: process.env.DATABASE_PASSWORD
});

//Connexion link alternative :
//const client = new Client(process.env.DATABASE_URL);


client.connect((err) => {
     if (err){
         console.log(err);
     }
     else {
         console.log("Data logging initiated.")
     }
})

//Export client : object or function ?
module.exports = client;