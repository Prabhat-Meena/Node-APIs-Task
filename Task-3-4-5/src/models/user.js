const mongoose = require('mongoose');
const validator = require("validator");

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
// Task modle require karenge user ke sath tasks ko bhi remove karne ke liye
const Post = require('./post.js')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
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
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error("Age must be a positive number and under 100")
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

// setup a virtual property, a vertual property is not actual data stored in the data base its a relationship between two entities in this case b/w our user and our task
// first parameter me hm koi bhi name de sakte hai abhi hm task de rahe hai
userSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'owner'
})


userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    // delete userObject.avatar

    return userObject;
}


// and our methods are accessible on instances
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
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

//// Delete user tasks when user is removed

userSchema.pre('remove', async function (next) {
    const user = this 
    await Post.deleteMany({owner: user._id})
    next()
})


// jo pehele hm models me direct second option me object put krte the uski  jaga schema use karenge so  we can use middleware
const User = mongoose.model('User', userSchema)

module.exports = User;