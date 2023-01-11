const mongoose = require('mongoose');
const validator = require("validator");

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is invalid")
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error("Can't use password as your password please use more secure password")
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }],
}, {
    timestamps: true
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject;
}


// and our methods are accessible on instances
userSchema.methods.generateAuthToken = async function () {
    const user = this
    console.log("userschema:", user);
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
    console.log("userschema: ", token);
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}



// login karne ke liye email or password match karenge
// static methods are accessible on the model sometime called model methods
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})
    
    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error("Unable to login")
    }

    return user
}


// hash the plan text password before sacing
userSchema.pre('save', async function (next){
    const user = this

    if (user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})


const User = mongoose.model('User', userSchema)

module.exports = User;






























































// const mongoose = require("mongoose");


// const userSchema = new mongoose.Schema({
//     userName: {
//         type: String,
//         // required: true
//     },
//     userEmail: {
//         type: String,
//         // required: true
//     },
//     userPassword: {
//         type: String,
//         // required: true
//     }
// })

// const UserModel = mongoose.model('User', userSchema)

// module.exports = UserModel;



