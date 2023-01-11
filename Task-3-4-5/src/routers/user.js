const express = require('express');


const User = require('../models/user.js')
const bcrypt = require('bcryptjs')
const auth = require("../middleware/auth.js");

const router = new express.Router()


router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save()
        // after crating and saving tocken in data base we will gage tocken for singup
        const token = await user.generateAuthToken()
        // res.status(201).send(user);
        res.status(201).send({user, token});
    } catch (error) {
        res.status(400).send(error)
    }

});

router.post("/users/login", async (req, res)=>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        // res.send(user)
        res.send({ user, token})
        // res.send({ user: user.getPublicProfile(), token})

    } catch (error) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token;
    })
    await req.user.save()
    res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async(req, res)=>{
    try {

        req.user.tokens = []
        await req.user.save()
        res.send()

    } catch (error) {
        res.status(500).send()
    }
})
// To add middleware to an individul route, all we do is pass it as an argument to the methode before we pass our route handler. 
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)

})


router.patch('/users/me', auth, async (req, res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdate = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((updates)=>allowedUpdate.includes(updates))

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid updates!'})
    }

    try {
        // const user = await User.findById(req.params.id)
        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }

})


router.delete('/users/me', auth, async(req, res)=>{
    try {
        await req.user.remove()
        res.send(req.user)
        
    } catch (error) {
        res.status(400).send(error)
    }
})



module.exports = router;