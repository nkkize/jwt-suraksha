const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();

app.use(express.json());

const users = [];

const posts = [
    {
        username: 'narender',
        title: 'post1'
    },
    {
        username: 'kumar',
        title: 'post2'
    }
]
app.get('/posts', (req, res) => {
    res.json(posts);
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
        res.send('success');
       } else {
           res.send('not allowed');
       }
    } catch(err){
        res.status(500).send();
    }
});

app.listen(3000);