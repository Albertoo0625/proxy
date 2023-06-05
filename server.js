const express=require('express');
const { pipeline } = require('stream');
const axios=require('axios');
const app=express();
require("dotenv").config();
const port=process.env.PORT;

app.use(express.urlencoded({extended: false}));

app.use(express.json());

app.use('/stream',require('./routes/stream'))


app.listen(port,()=>{
    console.log(`listening on port ${port}`)
})
