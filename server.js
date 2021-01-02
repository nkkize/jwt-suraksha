require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();

app.use(express.json());

const users = [];

const posts = [
    {
        name: 'narender',
        title: 'post1'
    },
    {
        name: 'kumar',
        title: 'post2'
    }
]
app.get('/posts', authenticateToken, (req, res) => {
    res.json(posts.filter(post => post.name === req.user.name));
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        return res.sedStatus(401);
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) {
            return res.sendStatus(403);
        }

        req.user = user;
        next();
    })
}

app.listen(3000);