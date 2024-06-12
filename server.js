const Phoenixa = require('./phoenixa');

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

const PORT = 9000;

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
server.beforeEach((request, response, next) => {
  if (request.headers['content-type'] === 'application/json') {
    if (request.headers['content-length'] < request.highWaterMark) {
      // Only good for JSON bodies smaller than highWatermarkValue
      // If the JSON body is large, write it back as a stream
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
      // todo: JSON Body is larger than highWatermarkValue handle through
      //  piping
      next();
    }
  } else {
    next();
  }
  
});

// Middleware that serves HTML to routes
server.beforeEach((request, response, next) => {
  const routesToServe = [
    '/',
    '/new-post',
    '/profile',
    '/login',
  ];
  
  if (routesToServe.indexOf(request.url) !== -1 && request.method === 'GET') {
    return response.status(200).sendFile('./public/index.html', 'text/html');
  } else {
    next();
  }
});

// ----- Files Routes ------ //

server.route('get', '/styles.css', (request, response) => {
  response.sendFile('./public/styles.css', 'text/css');
});

server.route('get', '/scripts.js', (request, response) => {
  response.sendFile('./public/scripts.js', 'text/javascript');
});

// ----- JSON Routes ------ //

// Log a user in and give them a token
server.route('post', '/api/login', (request, response) => {
  
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
    
    response.setHeader('Set-Cookies', `token=${token}; Path=/;`);
    
    response.status(200).json({message: 'Logged in Successfully'});
    console.log(`User with id ${user.userId} logged in!`);
  } else {
    response.status(401).json({message: 'Invalid username or password'});
  }
  
});

// todo: Log user out
server.route('delete', '/api/logout/', (request, response) => {

});

// todo: Update user information
server.route('put', '/api/user', (request, response) => {

});

// Send user info
server.route('get', '/api/user', (request, response) => {
  const user = USERS.find(user => user.userId === request.userId);
  response.json({name: user.name, username: user.username});
});

// See the lists of all the posts that we have
server.route('get', '/api/posts', (request, response) => {
  const posts = POSTS.map((post) => {
    post.author = USERS[post.userId - 1].name;
    return post;
  });
  
  response.status(200).json(posts);
});

// todo: Create a new post
server.route('post', '/api/new-post', (request, response) => {

});
