
--Comments
CREATE DATABASE groupomania_DB1

--\c into groupomania_DB1

--\Now, create others tables in pgadmin.
--\Quid du client.end ? Laisser ou non ?

CREATE TABLE users (
    id serial primary key,
    name_surname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
)

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    body VARCHAR(280) NOT NULL,
    post_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modification_date TIMESTAMP,--implement on backend with javascript when updating post.
    shared_picture VARCHAR(255), --Envoyer le lien de l'ancienne image (pour suppr) via le formulaire frontend au lieu d'envoyer une requête à la DB ?
    likes integer NOT NULL DEFAULT 0,
    dislikes integer NOT NULL DEFAULT 0,
    usersLiked varchar[], --Array of users who liked the post.
    usersDisliked varchar[],
    author_id integer NOT NULL,
)

ALTER TABLE comments ADD CONSTRAINT fk_post_id FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE

CREATE TABLE comments (
    id serial primary key UNIQUE,
    body VARCHAR(280) NOT NULL,
    comment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modification_date TIMESTAMP, --implement on backend with javascript when updating comment.
    shared_picture VARCHAR(255),
    author_id integer NOT NULL,
        CONSTRAINT FK_PostAuthor
        FOREIGN KEY (author_id) references users(id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,    
    parent_id integer NOT NULL,
    post_id integer NOT NULL,
        CONSTRAINT FK_PostParent
        FOREIGN KEY (post_id) references posts(id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,

    --Comment obtenir dans l'API l'id du parent,
    --sachant que cela peut-être soit l'id d'un commentaire, soit l'id d'un post ?
    --Dans les paramètres de la requête html, comme pour les posts ?

    --children_id integer
    --En a-t-on besoin, pour créer un arbre de commentaires ?
    --Sinon, comment l'implémenter uniquement avec parents_id ?

    --Je ne renvoie rien avec le code HTTP 200 pour modifier les commentaires ou les posts. C'est un PB ?
    --Si oui, comment faire ? Une deuxième querry avec SELECT ? "RETURNING *" ne fonctionne pas.
)
    --Est-ce que l'on ne risque pas d'avoir un problème dans le cas où 
    --l'id parente est égale à l'id du commentaire ? Si oui, comment le régler ?

    --Si l'on trouve l'user dans les deux arrays (usersdisliked et usersliked),
    --est-ce que l'on doit le supprimer des deux, en plus de l'erreur que l'on retournera ?

    --Est-ce que je peux étaler un opération ternaire sur plusieurs lignes pour rendre le code + clair ?

    --Typescript vaut-il mieux que javascript uniquement dans toutes les situations ?
    --TypeORM vaut-il mieux que Sequelize dans ce contexte (puisque prévu pour typescript directement) ?

    --A propos des revues de code. Dans le quotidien, quand on débute, j'imagine qu'on se contente de suivre les instructions,
    --sans trop donner son avis. Ou bien est-ce que l'on attend de nous que l'on fasse des code reviews sur les autres aussi ?

    --Attentre de mieux maitriser JS avant de passer à TS ? L'apprendre en vaut-il la peine ?

    --Réponses de la DB même quand elle n'est pas connectée ?

    --getCommentsByParentId n'est plus utile, si ? Puisque j'ai une route qui m'envoie tous les commentaires liés à un post,
    --et puisque je pourrai utiliser parent_id et comment_date pour les trier dans le frontend.

CREATE TABLE user_profiles (
    id serial primary key,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_names VARCHAR(255) NOT NULL REFERENCES users(name_surname) ON DELETE CASCADE,
    date_of_birth DATE,
    profile_pic_url VARCHAR(255) NOT NULL, -- url de l'image de profil avec multer. 
    job VARCHAR(255) NOT NULL,
    date_joined TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
)