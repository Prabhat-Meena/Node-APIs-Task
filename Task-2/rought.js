const express = require("express");
const app = express();

require("./db/mongoose.js");
require("./db/passport.js")

const bcrypt = require("bcrypt");

const cors = require("cors");

const jwt = require("jsonwebtoken");

const UserModel = require("./model/user.js");
const passport = require("passport");
const { session } = require("passport");

const port = process.env.PORT

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors());
app.use(passport.initialize())


app.post("/register", (req, res) => {

    console.log(req.body);

    let user = new UserModel({
        userName: req.body.name,
        userEmail: req.body.email,
        userPassword: bcrypt.hashSync(req.body.password, 8)
    })

    user.save().then(user =>
        res.send({
            success: true,
            message: "User created successfully",
            user: {
                id: user._id,
                userName: user.userName
            }
        })).catch(err => {
            res.send({
                success: false,
                message: "something went wrong",
                error: err
            })
        })
})


app.post("/login", (req, res) => {

    UserModel.findOne({ userName: req.body.name }).then(user => {
        console.log("index:" , user);
        
        //if no user found
        if(!user){
            return res.status(401).send({
                success: false,
                message: "Could not find the user",
            })
        }

        if(!bcrypt.compareSync(req.body.password, user.userPassword)){
            return res.status(401).send({
                success: false,
                message: "Incorrect password",
            })
        }

        const payload = {
            userName: user.userName,
            id: user._id
        }

        const token = jwt.sign(payload, "Rendom string", {expiresIn: "1d"})

        return res.status(200).send({
            success: true,
            message: "logged in succesfully",
            token: "Bearer " + token
        })


    }).catch((err) => {
        res.send(err)
    });
})

app.get("/protected", passport.authenticate('jwt', {session: false}), (req, res)=>{
    console.log(req.user)
    res.status(200).send({
        success: true,
        user: {
            id : req.user._id,
            name: req.user.userName
        }
    })
})

app.listen(port, () => {
    console.log(`Server connected on port http://localhost:${port} `);
})



// var JwtStrategy = require('passport-jwt').Strategy,
//     ExtractJwt = require('passport-jwt').ExtractJwt;
// var opts = {}
// opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// opts.secretOrKey = 'secret';
// opts.issuer = 'accounts.examplesoft.com';
// opts.audience = 'yoursite.net';
// passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
//     User.findOne({id: jwt_payload.sub}, function(err, user) {
//         if (err) {
//             return done(err, false);
//         }
//         if (user) {
//             return done(null, user);
//         } else {
//             return done(null, false);
//             // or you could create a new account
//         }
//     });
// }));