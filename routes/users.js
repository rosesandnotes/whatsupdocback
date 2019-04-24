const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const keys = require('../config/keys');
const jwt = require('jsonwebtoken');

router.post('/register', (req,res) => {
  User.findOne({email: req.body.email}).then(user => {
    if(user){
      return res.status(400).json({email: "Email already exists"});
    }else{
      (req.body.email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });

      const newUser = new User({
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash)=> {
          if(err) throw err;
          newUser.password = hash;
          newUser
          .save()
          .then(user => res.json(user))
          .catch(err=> console.log(err));
        });
      });
    }
  });
});

router.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({email}.then(user => {
    if(!user){
      return res.status(400).json({
        email: "User account does not exist"
      });
    }else{
      bcrypt.compare(password, user.password).then(isMatch => {
        if(isMatch){
          const payload = {id:user.id, firstname: user.firstname};

          jwt.sign(
            payload,
            keys.secret,
            {expiresIn: 3600},
            (err, token) => {
              res.json({
                success: true,
                token: 'Bearer ' + token,
                firstname: user.firstname
              });
            }
          )
        }else{
          return res.status(400).json({email:"Password is invalid"})
        }
      })
    }
  }))
});

module.exports = router;