const mongoose = require('mongoose');

mongoose.set('strictQuery', true)
//connecting mongoose
mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser: true
}).then(() => {
    console.log("Connected successful");
}).catch((err) => {
    console.log("no connection", err);
});