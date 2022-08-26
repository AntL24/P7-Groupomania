
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
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    body VARCHAR(280) NOT NULL,
    post_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modification_date TIMESTAMP,--implement on backend with javascript when updating post.
    shared_picture VARCHAR(255),
    --vote_id integer references votes(id), -- implement later, when we have votes
    author_id integer NOT NULL,--ON DELETE CASCADE ? Cela ne risque-t-il pas de causer pb si on perd des posts importants ?
        CONSTRAINT FK_PostAuthor
        FOREIGN KEY (author_id) references users(id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
)

CREATE TABLE comments (
    id serial primary key,
    body VARCHAR(280) NOT NULL,
    comment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modification_date TIMESTAMP, --implement on backend with javascript when updating comment.
    author_id integer references users(id),
    post_id integer references posts(id),
    shared_picture VARCHAR(255),
)


CREATE TABLE user_profiles (
    id serial primary key,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_names VARCHAR(255) NOT NULL REFERENCES users(name_surname) ON DELETE CASCADE,
    date_of_birth DATE,
    profile_pic_url VARCHAR(255) NOT NULL, -- url de l'image de profil avec multer. 
    job VARCHAR(255) NOT NULL,
    date_joined TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
)


 -- likes
CREATE TABLE votes (
    id serial primary key, --(int, PK) ?
    post_id integer references posts(id),
    voter_id integer references users(id),
    -- le nombre de likes (comment l'implémenter ?) --table de correspondances
    is_Like_Or_Dislike boolean NOT NULL,
    --So any time a user "likes" something you add
    --a record to that table setting IsLike to true.

    --If they "dislike" something then you add a record
    --to that table setting IsLike to false.
    --You can change around the terminology/names/types/etc. but
    --the general idea is the same. A "like" becomes a
    --linking record between a User and a Topic.

    --1)So when displaying the topic, you just select the count
    --of records from the linking table which are associated
    --with that topic.
    --2)And when displaying a user you select
    --the records from the linking table which are associated
    --with that user.

)