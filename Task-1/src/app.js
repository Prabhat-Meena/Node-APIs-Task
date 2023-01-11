const express = require("express");
const app = express();

//requiring mongoose from db/mongoose.js
require("./db/mongoose.js");

const port = process.env.PORT

app.get("/", (req, res)=>{
    res.send("Hello World")
});

app.listen(port, ()=>{
    console.log(`Server is running at port no ${port}`);
});

