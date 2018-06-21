const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

const User = require('../../models/User');

router.get('/test', (req, res) => res.json({toto: "toto"}) );

// @route api/users/register
router.post('/register', (req, res) => {
    User.findOne({ email: req.body.email })
        .then( user => {
            if (user) {
                return res.status(400).json({email: "Email already exists"});
            }
            const avatar = gravatar.url(req.body.email, {
                s: '200', //size
                r: 'pg', // rating
                d: 'mm' //default
            });

            user = new User({
                name: req.body.name,
                email: req.body.email,
                avatar,
                password: req.body.password
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(user.password, salt, (err, hash) => {
                    if (err) {
                        throw err;
                    }

                    user.password = hash;
                    user.save()
                        .then(user => res.json(user))
                        .catch(err => console.log(err));
                });
            });
        })
        .catch(err => console.log(err));
});

module.exports = router;