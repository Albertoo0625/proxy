const axios = require('axios');
const { pipeline } = require('stream');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const express=require('express');
const app=express();

let assignedPort;

const handleRequest = async (req, res) => {
  try {
    const url = req.body.url;
    console.log(url);
    const response = await axios.get(url, {
      responseType: 'stream',
    });

    // Set the appropriate headers for the response
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Create a server instance with the trailer option enabled
    const server = createServer((req, serverResponse) => {
      pipeline(response.data, serverResponse, (error) => {
        if (error) {
          console.error('Pipeline encountered an error:', error);
        }
        serverResponse.end(); // End the response after sending the content
      });
    });

    // Start the server and listen on a dynamic port
    server.listen(0, () => {
      assignedPort = server.address().port;
      console.log(`Server is running on port ${assignedPort}`);
    });


    const responseServer=require('http').createServer(app)
    const responseio=require("socket.io")(responseServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    responseio.on('connection',(socket)=>{
      console.log('a user connected');
      socket.send(assignedPort.toString());

      socket.on('error', console.error);
    });

    responseServer.listen(8080,()=>{
      console.log('server listening on port 8080');
    });


    const serverio=require("socket.io")(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    serverio.on('connection',(socket)=>{
      console.log('stream started');
      socket.send('stream started');

      socket.on('error', console.error);
    });

    // serverio.listen(assignedPort,()=>{
    //   console.log(`streaming server listening on port ${assignedPort}`);
    // });
  

  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = { handleRequest };
