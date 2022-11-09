

#P7-GROUPOMANIA

Installation :

EN

First, clone the project on Github, or download the zip file. Open the resulting folder in vsCode.

Frontend : open the terminal in the \front folder and run "npm install" in order to install the dependencies. Type "ng serve" or "npm start" to activate the front server of the site.

Backend : open the terminal in the \back folder. Install dependencies with "npm i". Load nodemon: "npm install -g nodemon", and finally, launch the back with the command: "nodemon index.js". Don't forget to put the psql server online and to connect with pgadmin: the database dump is attached to the project folder.

In case of difficulties during the initial connection to the server from node, set up a connection link to the database. This avoids confusion by the software between the username of the windows session and the pgadmin user.

Do not forget to set up environment variables to allow connexion to DB (see env. example)

To connect, open localhost:3000 in your browser. In order to register, the user must provide a unique email and a password.

FR

Tout d'abord, cloner le projet sur Github, ou télécharger le fichier zip. Ouvrir le dossier obtenu dans vsCode.

Pour le Frontend, ouvrez le terminal sur le dossier \front et exécutez "npm install" afin d'installer les dépendances. Taper "ng serve" ou "npm start" pour activer le serveur front du site.

Pour le Backend, ouvrez le terminal sur le dossier \back. Installez les dépendances avec "npm i". Chargez nodemon : "npm install -g nodemon", et enfin, lancez le back avec la commande : "nodemon index.js". N'oubliez pas de mettre le serveur psql en ligne et de vous connecter à pgadmin : le dump de la base de donnée est joint au dossier projet.

En cas de difficultés lors de la connexion initiale au serveur depuis node, mettre en place un lien de connexion vers la base de données. Cela permet d'éviter une confusion par le logiciel entre l'username de la session windows et l'utilisateur pgadmin.

Ne pas oublier de mettre en place les variables d'environnement pour la connexion à la DB, suivant le modèle dans env. example. 

Pour se connecter, ouvrir localhost:3000 dans votre navigateur. Afin de s'enregistrer, l'internaute doit fournir un email unique et un mot de passe.
