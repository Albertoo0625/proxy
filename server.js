const express=require('express');
const { pipeline } = require('stream');
const axios=require('axios');
const app=express();
require("dotenv").config();
const port=process.env.PORT;

const cors=require('cors');

app.use(express.urlencoded({extended: false}));

app.use(express.json());

const corsOptions = {
    origin: '*',
  };

app.use(cors(corsOptions));

app.use('/stream',require('./routes/stream'))


app.listen(port,()=>{
    console.log(`listening on port ${port}`)
})
