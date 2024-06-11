const Phoenixa = require('./phoenixa');

// ----- Database ------ //

const USERS = [
  {id: 1, name: 'Liam', username: 'liam', password: 'string'},
  {id: 2, name: 'Jane', username: 'jane', password: 'string'},
  {id: 3, name: 'Brown', username: 'brown', password: 'string'},
  {id: 4, name: 'Meredith', username: 'meredith', password: 'string'},
  {id: 5, name: 'Elisa', username: 'elisa', password: 'string'},
  {id: 6, name: 'Grace', username: 'grace', password: 'string'},
];

const POSTS = [
  {
    id: 1,
    body: 'ultimate dead will spirit ideal self strong prejudice joy sea. Disgust ocean snare marvelous ocean chaos intentions pinnacle merciful spirit good justice truth. Ocean intentions war dead overcome moral.',
    title: 'Convolutional Neural Nets',
    userId: 4,
  },
  {
    id: 2,
    body: 'Self virtues disgust faithful inexpedient gains snare faithful horror law eternal-return truth noble. Oneself ascetic ocean free mountains ubermensch decieve war decrepit ubermensch value. Eternal-return insofar god of prejudice. Snare eternal-return virtues sexuality marvelous endless suicide value law depths evil. Ultimate intentions madness hatred insofar self christianity evil joy hatred derive play convictions. Sea good intentions battle against value of superiority mountains mountains love. Snare zarathustra will inexpedient burying will ubermensch holiest strong chaos insofar god enlightenment aversion.',
    title: 'Recurrent Neural Nets',
    userId: 6,
  },
  {
    id: 3,
    body: 'Holiest oneself spirit marvelous battle against morality. Ubermensch god revaluation sexuality sexuality ascetic.',
    title: 'Feed Forward Neural Nets',
    userId: 4,
  },
  {
    id: 4,
    body: 'Hatred decrepit derive pious ubermensch of oneself strong madness disgust disgust holiest enlightenment. Horror spirit dead society aversion. Abstract merciful superiority dead hatred eternal-return disgust salvation hatred. Zarathustra sea morality disgust christian salvation good christian self war transvaluation endless.',
    title: 'Spiking Neural Nets',
    userId: 1,
  },
];

const PORT = 9000;

const server = new Phoenixa();

server.listen(PORT, () => {
  console.log('Server has started on port ' + PORT);
});

// ----- Files Routes ------ //
server.route('get', '/', (request, response) => {
  response.sendFile('./public/index.html', 'text/html');
});

server.route('get', '/login', (request, response) => {
  response.sendFile('./public/index.html', 'text/html');
});

server.route('get', '/styles.css', (request, response) => {
  response.sendFile('./public/styles.css', 'text/css');
});

server.route('get', '/scripts.js', (request, response) => {
  response.sendFile('./public/scripts.js', 'text/javascript');
});

// ----- JSON Routes ------ //
server.route('post', '/api/login', (request, response) => {
  let data = '';
  request.on('data', chunk => {
    data += chunk.toString('utf-8');
  });
  
  request.on('end', () => {
    data = JSON.parse(data);
    
    const username = data.username;
    const password = data.password;
    
    // Check if user exists
    const user = USERS.find(user => user.username === username)
    
    // Check the password if the user was found
    if (user && user.password === password) {
      // At this point, we know client is who he say he is.
      response.status(200).json({message: 'Logged in Successfully'});
    } else {
      response.status(401).json({message: 'Invalid username or password'});
    }
  });
});


server.route('get', '/api/user', (request, response) => {

});

// See the lists of all the posts that we have
server.route('get', '/api/posts', (request, response) => {
  const posts = POSTS.map((post) => {
    post.author = USERS[post.userId - 1].name;
    return post;
  });
  
  response.status(200).json(posts);
});
