require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();

app.use(express.json());

const users = [];
let refreshTokens = [];

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
        const accessToken = generateAccessToken(user);
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
        refreshTokens.push(refreshToken);
        res.json({accessToken: accessToken, refreshToken: refreshToken});
       } else {
           res.send('not allowed');
       }
    } catch(err){
        res.status(500).send();
    }   
});

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    res.sendStatus(204);
});

app.post('/token', (req, res) => {
    const refreshToken = req.body.token;
    if(!refreshToken){
        return res.sendStatus(401);
    }

    if(!refreshTokens.includes(refreshToken)){
        return res.sendStatus(403);
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err){
            return res.sendStatus(403);
        }
        const accessToken = generateAccessToken({name: user.name});
        res.json({accessToken: accessToken});
    })
})

function generateAccessToken(user){
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '30s'});
}

app.listen(4000);