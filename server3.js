const Phoenixa = require('./phoenixa');
const constants = require('node:constants');

// ----- Database ------ //

// Sample objects => {userId: 1, token: 220379239}
const SESSIONS = [];

const USERS = [
  {userId: 1, name: 'Liam', username: 'liam', password: 'string'},
  {userId: 2, name: 'Jane', username: 'jane', password: 'string'},
  {userId: 3, name: 'Brown', username: 'brown', password: 'string'},
  {userId: 4, name: 'Meredith', username: 'meredith', password: 'string'},
  {userId: 5, name: 'Elisa', username: 'elisa', password: 'string'},
  {userId: 6, name: 'Grace', username: 'grace', password: 'string'}];

const POSTS = [
  {
    postId: 1,
    body: 'ultimate dead will spirit ideal self strong prejudice joy sea. Disgust ocean snare marvelous ocean chaos intentions pinnacle merciful spirit good justice truth. Ocean intentions war dead overcome moral.',
    title: 'Convolutional Neural Nets',
    userId: 4,
  }, {
    postId: 2,
    body: 'Self virtues disgust faithful inexpedient gains snare faithful horror law eternal-return truth noble. Oneself ascetic ocean free mountains ubermensch decieve war decrepit ubermensch value. Eternal-return insofar god of prejudice. Snare eternal-return virtues sexuality marvelous endless suicide value law depths evil. Ultimate intentions madness hatred insofar self christianity evil joy hatred derive play convictions. Sea good intentions battle against value of superiority mountains mountains love. Snare zarathustra will inexpedient burying will ubermensch holiest strong chaos insofar god enlightenment aversion.',
    title: 'Recurrent Neural Nets',
    userId: 6,
  }, {
    postId: 3,
    body: 'Holiest oneself spirit marvelous battle against morality. Ubermensch god revaluation sexuality sexuality ascetic.',
    title: 'Feed Forward Neural Nets',
    userId: 4,
  }, {
    postId: 4,
    body: 'Hatred decrepit derive pious ubermensch of oneself strong madness disgust disgust holiest enlightenment. Horror spirit dead society aversion. Abstract merciful superiority dead hatred eternal-return disgust salvation hatred. Zarathustra sea morality disgust christian salvation good christian self war transvaluation endless.',
    title: 'Spiking Neural Nets',
    userId: 1,
  }];

// ----- Server ------ //

const PORT = 9003;

const server = new Phoenixa();

server.listen(PORT, () => {
  console.log('Server has started on port ' + PORT);
});

// ----- Middlewares ------ //

// Authentication Middleware
// Authenticate users on each request, unlike login which logs user in once
server.beforeEach((request, response, next) => {
  // official routes
  const routesToAuthenticate = [
    // CRUD
    'GET /api/user',      // Read
    'PUT /api/user',      // Update
    'POST /api/new-post', // Create
    'DELETE /api/logout',  // Delete
  ];
  
  // Only authenticate the official routes
  if (routesToAuthenticate.indexOf(request.method + ' ' + request.url) !== -1) {
    
    // If we have a token cookie, then save the user id to the request object
    if (request.headers.cookie) {
      const token = request.headers.cookie.split('=')[1];
      
      const session = SESSIONS.find(session => session.token === token);
      if (session) {
        request.userId = session.userId;
        return next();
      }
    }
    return response.status(401).json({error: 'Unauthorized Request'});
  } else {
    next();
  }
});

// JSON Body Parser Middleware
const parseJSON = (request, response, next) => {
  if (request.headers['content-type'] === 'application/json') {
    
    // Only good for JSON bodies smaller than highWatermarkValue
    // If the JSON body is large, write it back as a stream
    // todo: JSON Body is larger than highWatermarkValue handle through
    //  piping
    let data = '';
    request.on('data', chunk => {
      data += chunk.toString();
    });
    
    request.on('end', () => {
      data = JSON.parse(data);
      request.body = data;
      return next();
    });
  } else {
    next();
  }
};

// For parsing JSON body
server.beforeEach(parseJSON);

// Middleware that serves HTML to routes
server.beforeEach((request, response, next) => {
  const routesToServe = [
    '/',
    '/login',
    '/profile',
    '/new-post',
  ];
  
  if (routesToServe.indexOf(request.url) !== -1 && request.method === 'GET') {
    return response.status(201).sendFile('./public/index.html', 'text/html');
  } else {
    next();
  }
});

// ----- Files Routes ------ //

server.route('GET', '/styles.css', (request, response) => {
  response.status(201).sendFile('./public/styles.css', 'text/css');
});

server.route('GET', '/scripts.js', (request, response) => {
  response.status(201).sendFile('./public/scripts.js', 'text/javascript');
});

// ----- JSON Routes ------ //

// Log a user in and give them a token
server.route('POST', '/api/login', (request, response) => {
  const username = request.body.username;
  const password = request.body.password;
  
  // Check if user exists
  const user = USERS.find(user => user.username === username);
  
  // Check the password if the user was found
  if (user && user.password === password) {
    // At this point, we know a client is who he says he is.
    // Generating user token and creating a user session
    const token = Math.floor(Math.random() * 1000000000).toString();
    SESSIONS.push({userId: user.userId, token: token});
    
    response.setHeader('Set-Cookie', `token=${token}; Path=/;`);
    response.status(200).json({message: 'Logged in Successfully'});
  } else {
    response.status(401).json({message: 'Invalid username or password'});
  }
  
});

// Log user out
server.route('DELETE', '/api/logout', (request, response) => {
  // Remove the session from DB
  const sessionIndex = SESSIONS.findIndex(
      session => session.userId === request.userId);
  if (sessionIndex > -1) {
    SESSIONS.splice(sessionIndex, 1);
  }
  // Deleting the cookie
  response.setHeader('Set-Cookie', 'token=deleted; Path=/; Expires=Thu, 01' +
      ' Jan 1970 00:00:00 GMT');
  response.status(200).json({message: 'Logged out successfully'});
});

// Send user info
server.route('GET', '/api/user', (request, response) => {
  const user = USERS.find(user => user.userId === request.userId);
  response.json({username: user.username, name: user.name});
});

// Update user information
server.route('PUT', '/api/user', (request, response) => {
  const username = request.body.username;
  const name = request.body.name;
  const password = request.body.password;
  
  // Grab the current logged in user
  const user = USERS.find(user => user.userId === request.userId);
  
  user.username = username;
  user.name = name;
  
  // Only update the password if its provided
  if (password) {
    user.password = password;
  }
  
  response.status(200).
      json({
        username: user.username,
        name: user.name,
        password_status: password ? 'updated' : 'not-updated',
      });
});

// See the lists of all the posts that we have
server.route('GET', '/api/posts', (request, response) => {
  const posts = POSTS.map((post) => {
    const matchedUser = USERS.find(user => user.userId === post.userId);
    
    if (matchedUser) {post.author = matchedUser.name;}
    return post;
  });
  
  response.status(200).json(posts);
  
});

// Create a new post
server.route('POST', '/api/posts', (request, response) => {
  const title = request.body.title;
  const body = request.body.body;
  
  const post = {
    postId: POSTS.length + 1,
    title: title,
    body: body,
    userId: request.userId,
  };
  
  POSTS.unshift(post);
  response.status(201).json(post);
});
