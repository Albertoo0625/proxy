const axios = require('axios');
const { pipeline } = require('stream');
const { createServer } = require('http');

let port;

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
    

    // Create a server instance
    const server = createServer((req, res) => {
      
      pipeline(response.data, res, (error) => {
        if (error) {
          console.error('Pipeline encountered an error:', error);
        }
      });
    });

    // Start the server and listen on a dynamic port
    server.listen(0, () => {
      port = server.address().port;
      console.log(`Server is running on port ${port}`);
      console.log(`http://localhost:${port}`);
      res.setHeader('Stream-port', port);
    });

    // Send the port number as the response after a slight delay
    
   
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = { handleRequest };
