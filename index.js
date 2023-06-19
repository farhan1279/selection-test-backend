const express = require('express')
const app = express()
const cors = require('cors');
const PORT = 5000


//import router
const { userRouter, authRouter, postRouter } = require('./router')


app.use(express.json())

//test application connection
app.get("/", (req, res) => {
    res.send({
        success: true,
        message: "pos system connection success",
        data: {}
    })
})

app.use(cors())
app.use('/user', userRouter)
app.use('/auth',authRouter)
app.use('/',postRouter)


app.listen(PORT, () => {
    console.log("server run on port : ", PORT);
})
