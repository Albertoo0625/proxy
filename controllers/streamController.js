const axios = require('axios');
const { pipeline } = require('stream');
const { createServer } = require('http');

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

    // Listen on a dynamic port
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error('Port already in use, retrying with a different port...');
        server.close();
        server.listen(0);
      } else {
        console.error('Server encountered an error:', error);
      }
    });

    server.listen(0, () => {
      assignedPort = server.address().port;
      console.log(`Server is running on port ${assignedPort}`);
      console.log(`http://localhost:${assignedPort}`);
    });

    // Create a separate HTTP server to send the port number as the response
    const responseServer = createServer((req, serverResponse) => {
      serverResponse.setHeader('Content-Type', 'text/plain');
      serverResponse.end(assignedPort.toString()); // Send the port number as the response
    });

    // Listen on a fixed port for sending the response
    responseServer.listen(3000, () => {
      console.log('Response server is running on port 3000');
    });
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = { handleRequest };
