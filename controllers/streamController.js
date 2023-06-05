const axios = require('axios');
const { pipeline } = require('stream');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');

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

    const wss = new WebSocketServer({ server: server });

    wss.on('connection', function connection(ws) {
      
      // Send the assigned port to the client
      ws.send(assignedPort.toString());

      ws.on('message', function message(data) {
        console.log('received: %s', data);
      });

      ws.on('error', console.error);
    });
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = { handleRequest };
