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


app.get('/users', (req, res) => {
    res.json(users);
});

app.post('/users', async (req, res) => {

    try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        console.log(salt);
        console.log(hashedPassword);

        const user = {
            name: req.body.name,
            password: hashedPassword,
        };

        users.push(user);
        res.status(201).send();
    } catch (err) {
        res.status(500);
    }

});

app.post('/login', (req, res) => {
    const user = users.find(u => u.name == req.body.name);
    if(user == null){
        res.status(400).send("cannot find user");
    }

    try{
       if(bcrypt.compare(req.body.password, user.password)){
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
        res.json({accessToken: accessToken});
       } else {
           res.send('not allowed');
       }
    } catch(err){
        res.status(500).send();
    }   
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