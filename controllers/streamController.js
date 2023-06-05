const axios = require('axios');
const { pipeline } = require('stream');
const { createServer } = require('http');
const { Server } = require('socket.io');

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
        console.log(serverResponse.headersSent);
        serverResponse.end(); // End the response after sending the content
      });
    });

    // Start the server and listen on a dynamic port
    server.listen(0, () => {
      assignedPort = server.address().port;
      console.log(`Server is running on port ${assignedPort}`);

      // Add trailing header with the assigned port
      res.addTrailers({ 'Dynamic-Port': assignedPort.toString() });
    });

    // Create a WebSocket server instance
    const io = new Server(server);

    io.on('connection', (socket) => {
      // Send the assigned port to the client
      socket.send(assignedPort.toString());

      socket.on('message', (data) => {
        console.log('received: %s', data);
      });

      socket.on('error', console.error);
    });
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = { handleRequest };
