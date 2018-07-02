const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const validatePostInput = require('../../validation/post');


// @route GET api/posts/
// @desc get all posts
// @access Public
router.get('/', (req, res) => {
    Post.find()
        .sort({ date: - 1})
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({error: 'No posts yet'}));
});

// @route GET api/posts/:id
// @desc get a Post
// @access Public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(404).json({error: 'Post does not exist'}));
});

// @route POST api/posts
// @desc Create a Post
// @access Private
router.post('/',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { errors, isValid } = validatePostInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }

        const newPost = new Post({
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.user.id
        });

        newPost.save()
            .then(post => res.json(post));
    }
);

// @route Delete api/posts/:id
// @desc Delete a Post
// @access Private
router.delete('/:id',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        Profile.findOne({ user: req.user.id })
            .then( profile => {
                Post.findById(req.params.id)
                    .then(post => {
                        if (post.user.toString() !== req.user.id) {
                            return res.status(401).json({ error: 'Unauthorized request' });
                        }
                        console.log(post.user.toString(), req.user.id)
                        post.remove()
                            .then(() => res.json({ success: true}))
                            .catch(err => res.status(404).json({ error: 'What did you say?'}));
                    });
            })
            .catch(err => res.status(404).json({ error: 'What did you say?'}));
    }
);

// @route POST api/posts/like/:id
// @desc Like a post
// @access Private
router.post('/like/:id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id })
            .then( profile => {
                Post.findById(req.params.id)
                    .then(post => {
                        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                            return res.status(400).json({ error: 'You already liked this post' })
                        }

                        post.likes.unshift({ user: req.user.id });

                        post.save().then(post => res.json(post));
                    });
            })
            .catch(err => res.status(404).json({ error: 'What did you say?'}));

    }
);


// @route DELETE api/posts/like/:id
// @desc Unlike a post
// @access Private
router.delete('/like/:id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id })
            .then( profile => {
                Post.findById(req.params.id)
                    .then(post => {
                        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                            return res.status(400).json({ error: 'You have not liked this post, how could you dislike it? :/' })
                        }

                        const removeIndex = post.likes.map(item => item.    user.toString())
                                                        .indexOf(req.user.id);

                        post.likes.splice(removeIndex, 1);

                        post.save().then(post => res.json(post));
                    });
            })
            .catch(err => res.status(404).json({ error: 'What did you say?'}));
    }
);

// @route POST api/posts/comment/:id
// @desc Add a comment to a post
// @access Private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { errors, isValid } = validatePostInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }

        Post.findById(req.params.id)
            .then(post  => {
                const newComment = {
                    text: req.body.text,
                    name: req.body.name,
                    avatar: req.body.avatar,
                    user: req.user.id
                }

            post.comments.unshift(newComment)
            post.save()
                .then(post => res.json(post))
            })
            .catch(err => res.status(404).json({ error: 'Post not found'}));
    }
);


// @route DELETE api/posts/comment/:id/:comment_id
// @desc Delete a comment to a post
// @access Private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Post.findById(req.params.id)
            .then(post  => {
                if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
                    return res.status(404).json({ error: 'Comment not found'})
                }

                const removeIndex = post.comments
                                        .map(item => item._id.toString())
                                        .indexOf(req.params.comment_id);

                post.comments.splice(removeIndex, 1);

                post.save()
                    .then(post => res.json(post))
                })
            .catch(err => res.status(404).json({ error: 'Post not found'}));
    }
);
module.exports = router;