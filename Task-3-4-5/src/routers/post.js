const express = require('express');
const Post = require('../models/post.js');

const auth = require("../middleware/auth.js");
const router = new express.Router();

router.post('/posts', auth, async (req, res) => {
    // console.log(req.body);

    const post = new Post({
        ...req.body,
        owner: req.user._id
    })

    try {
        await post.save()
        res.status(201).send(post)
    } catch (error) {
        res.status(400).send(error)
    }

});

// GET/posts?ativate=false/true
//GET/posts?limit=10&skip=0
//GET/posts?sortBy=createdAt:asc/desc
router.get('/posts', auth, async (req, res) => {

    const match = {}
    const sort = {}

    if (req.query.active) {
        match.active = req.query.active === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        // const posts = await Post.find({ owner: req.user._id });
        await req.user.populate({
            path: 'posts',
            match,
            //pagination
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        res.send(req.user.posts)
    } catch (error) {
        res.status(500).send(error)
    }

});


router.get('/posts/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const post = await Post.findOne({ _id, owner: req.user._id })
        if (!post) {
            return res.status(404).send()
        }
        res.send(post)

    } catch (error) {
        res.status(500).send(error)
    }

})


router.patch('/posts/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdate = ['title', 'body', 'createdBy', 'active', 'geoLocation']
    const isValidOperation = updates.every((updates) => allowedUpdate.includes(updates))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try {

        const post = await Post.findOne({ _id: req.params.id, owner: req.user._id })

        // const post = await Post.findByIdAndUpdate(req.params.id, req.body, {new : true, runValidators: true})
        if (!post) {
            return res.status(404).send()
        }

        updates.forEach((update) => post[update] = req.body[update])
        await post.save()
        res.send(post)
    } catch (error) {
        res.status(400).send(error)
    }

})

router.delete("/posts/:id", auth, async (req, res) => {
    try {
        // const post = await Post.findByIdAndDelete(req.params.id)
        const post = await Post.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!post) {
            return res.status(404).send()
        }
        res.send(post)
    } catch (error) {
        res.status(500).send(error)
    }
})



// ******** TASK - 4 ***********//********************************** */

router.get('/posts', auth, async (req, res) => {

    const posts = await Post.findOne({ latitude: req.query.latitude, longitude: req.query.longitude })

    if (!post.latitude == req.query.latitude) {

        return res.status(404).send()
    }
    res.status(200).send(posts)
})




//************** Task - 5 ********************* */

router.get('/postsAll', auth, async (req, res) => {
    try {
        
        const post = await Post.find({owner: req.user._id })
        let activePost = 0
        let inactivePost = 0
        let totalPost = post.length
        let count = post.map((value, index)=>{
            // console.log(value, '==', index);
            return (value['active']==true?activePost++:inactivePost++)
        })
        res.send({
            totalPost: `Total posts are ${totalPost}`,
            activePost  : `Active posts are ${activePost}` ,
            inactivePost : `Inactive posts are ${inactivePost}`
        })
    } catch (error) {
        res.status(404).send()
    }

});








module.exports = router;