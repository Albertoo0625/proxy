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

    server.listen(0, () => {
      assignedPort = server.address().port;
      console.log(`Server is running on port ${assignedPort}`);
      console.log(`http://localhost:${assignedPort}`);
    });

    // Create a separate HTTP server to send the port number as the response
    const responseServer = createServer((req, serverResponse) => {
      serverResponse.setHeader('Content-Type', 'text/plain');
      serverResponse.end(JSON.stringify({ port: assignedPort })); // Send the port number as the response
    });

    responseServer.listen(0, () => {
      const responseServerPort = responseServer.address().port;
      console.log(`Response server is running on port ${responseServerPort}`);
    });
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = { handleRequest };
