const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');
const User = require('../../models/User');

router.get('/test', (req, res) => res.json({toto: "toto"}) );

// @route api/users/register
router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email })
        .then( user => {
            if (user) {
                errors.email = 'Email already exists';
                return res.status(400).json(errors);
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

// @route api/users/login
router.post('/login', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email})
        .then(user => {
            if (!user) {
                errors.email = 'User not found'
                return res.status(404).json(errors);
            }

            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        const payload = { id: user.id, name: user.name, avatar: email.avatar }
                        jwt.sign(payload,
                            keys.secretOrKey,
                            { expiresIn: 3600 },
                            (err, token) => {
                                res.json({
                                    token: 'Bearer ' + token
                                });
                            }
                        );
                    } else {
                        errors.password = 'Password incorrect'
                        return res.status(400).json(errors);
                    }
                });
        });
});

// @route GET api/users/current
// @return current user
// @access private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
    });
});


module.exports = router;