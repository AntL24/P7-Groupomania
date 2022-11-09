require("dotenv").config();

const express = require ("express");
const app = express();
const cors = require("cors"); //Cors intervient entre la requête et la réponse pour ajouter des headers.
const helmet = require('helmet');


//////////////
//Middleware//
//////////////
//Permet de définir un middleware qui va définir des headers pour les requêtes.
app.use(cors());
//express.json permet de récupérer les données envoyées dans le body de la requête, sous forme d'objet.
app.use(express.json());
//urlencoded permet de récupérer les données envoyées dans le body de la requête, sous forme de string ou de tableau.
app.use(express.urlencoded({extended: true}));
//Helmet help us secure our express server 
app.use(helmet(
    {crossOriginResourcePolicy: false},
    //sameorigin false
    
    ));
    


module.exports = {app, express};
