const express = require('express');
require('./db/mongoose.js')

const userRouter = require('./routers/user.js')
const postRouter = require('./routers/post.js')

const app = express();

const port = process.env.PORT


app.use(express.json());

app.use(postRouter)

app.use(userRouter)


app.listen(port, () => {
    console.log(`Server conected on port : http://localhost:${port}`);
});
