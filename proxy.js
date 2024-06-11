// Dependencies
const http = require("http");

// Proxy's Port
const PORT = 9000;

// List of Backend Servers
const mainServers = [
  {host: 'localhost', port: 9001},
  {host: 'localhost', port: 9002},
  {host: 'localhost', port: 9003},
];

// Proxy Server
const proxy = http.createServer();

proxy.listen(PORT,  () => {
  console.log(`Proxy Server is now listening on port: ${PORT}`);
});

proxy.on('request', (clientRequest, proxyResponse) => {
  // Select a server to route the incoming request using round-robin algorithms
  const mainServer = mainServers.shift();
  mainServers.push(mainServer);
  
  
  // The request that we are sending to one of our main servers
  const proxyRequest = http.request({
    host: mainServer.host,
    port: mainServer.port,
    path: clientRequest.url,
    method: clientRequest.method,
    headers: clientRequest.headers,
  });
  
  console.log('Routing to http://localhost:', mainServer.port);
  
  // Once we receive a response from one of our main servers
  proxyRequest.on('response', mainServerResponse => {
    // Set the status code and headers for the response that we are sending
    // to the client
    proxyResponse.writeHead(
        mainServerResponse.statusCode,
        mainServerResponse.headers,
    );
    
    // Finally, write the body of the main server's response to the body of
    // proxy's response
    mainServerResponse.pipe(proxyResponse);
  });
  
  // Our proxy should be extremely robust, so there is more error handling we do,
  // the better. We don't want our proxies to go down no matter what happens in
  // our main servers.
  proxyRequest.on('error', error => {
    console.log(error);
  });
  
  // Write the body of the client's request to the body of your proxy's request
  // being made to one of our servers.
  clientRequest.pipe(proxyRequest);
})
