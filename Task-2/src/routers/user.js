const express = require('express');

const User = require('../model/user.js')
const bcrypt = require('bcryptjs')
const auth = require("../middleware/auth.js");
const router = new express.Router()


router.post('/register', async (req, res) => {
    const user = new User(req.body);
    // console.log(user);
    try {
        await user.save()
        console.log(user);
        // after crating and saving tocken in data base we will gage tocken for singup
        const token = await user.generateAuthToken()
        console.log("user:",token);
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

    } catch (error) {
        res.status(400).send()
    }
})


// To add middleware to an individul route, all we do is pass it as an argument to the methode before we pass our route handler. 
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)

})


module.exports = router;