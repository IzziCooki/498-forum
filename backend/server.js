const express = require('express');
const app = express();
const session = require('express-session');
const hbs = require('hbs'); 
const path = require('path');
const PORT = process.env.PORT || 7101;

COMMENT_ID_COUNTER = 1; // For comment IDs

let users = [{ username: 'dean', password: '1234' }]; 
let comments = [ 
    { id: COMMENT_ID_COUNTER, author: 'Alice', text: 'Howdy partner!', createdAt: new Date().toLocaleTimeString("en-US", {timeZone: 'America/New_York'}) },
    { id: COMMENT_ID_COUNTER+=1, author: 'Bob', text: 'This forum is mighty fine.', createdAt: new Date().toLocaleTimeString("en-US", {timeZone: 'America/New_York'}) }
];
// Authentication Check (using isLoggedIn)
function ensureAuthenticated(req, res, next) {
    if (req.session.isLoggedIn) {
        return next();
    }
    res.redirect('/login');
}


app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
    console.log(`${req.method} request for '${req.url}'`);
    next();
});
app.use(session({
    secret: 'fdskfhkdsfhs-fdskjhfkjdshfkjsdf-blkvbjcvlk',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Home page
app.get('/', (req, res) => {
    let userViewModel = {
            name: "Guest",
            isLoggedIn: false,
        };

        if (req.session.isLoggedIn && req.session.username) {
            userViewModel = {
                name: req.session.username,
                isLoggedIn: true
            };
        }

        res.render('home', {
            layout: 'layout/main',
            title: 'Wild West Forum',
            user: userViewModel 
        });

});


// Register
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('register', {
            layout: 'layout/main',
            title: 'Register',
            error: 'Username and password are required.'
        });
    }

    // Check if username already exists 
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.render('register', {
            layout: 'layout/main',
            title: 'Register',
            error: 'Username already taken. Please choose another.'
        });
    }

    // Add new user
    users.push({ username, password });

    res.redirect('/login');
});

app.get('/register', (req, res) => {
        return res.render('register', {
            layout: 'layout/main', 
            title: 'Register'
        });
});

// Profile 
app.get('/profile', ensureAuthenticated, (req, res) => {

    const userViewModel = {
        name: req.session.username,
        isLoggedIn: req.session.isLoggedIn,
        loginTime: req.session.loginTime,
        visitCount: req.session.visitCount += 1 || 0 
    };

    const userComments = comments.filter(c => c.author === req.session.username);


    res.render('profile', {
        layout: 'layout/main', 
        title: 'Your Profile', 
        user: userViewModel,
        comments: userComments   
    });
});


// Login 
app.get('/login', (req, res) => {
    if (req.session.isLoggedIn) {
            return res.redirect('/');
        }
        res.render('login', {
            layout: 'layout/main', // Or remove if standalone
            title: 'Login'
        });
});


app.post('/login', (req, res) => {
    const { username, password } = req.body;

        if (!username || !password) {
            return res.render('login', {
                title: 'Login',
                error: 'Username and password are required.'
            });
        }

        const user = users.find(u => u.username === username);
        // Create new session if valid
        if (user && user.password === password) {
            req.session.isLoggedIn = true;
            req.session.username = user.username; 
            req.session.loginTime = new Date().toLocaleTimeString("en-US", {timeZone: 'America/New_York'}),
            req.session.visitCount = 0; 

            console.log(`User ${username} logged in.`);
            res.redirect('/');
        } else {
            res.render('login', {
                title: 'Login',
                error: 'Invalid username or password.'
            });
        }
});

// Comments
app.get('/comments', ensureAuthenticated, (req, res) => {
  const userViewModel = {
    name: req.session.username,
    isLoggedIn: true
  };

  const page = parseInt(req.query.page) || 1;
  const limit = 5;

  // Reverse comments array for newest first
  const reversedComments = [...comments].reverse();

  const totalPages = Math.ceil(reversedComments.length / limit);
  const currentPage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedComments = reversedComments.slice(startIndex, endIndex);

  // Build numbered pages
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push({ number: i, isCurrent: i === currentPage });
  }

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  res.render('comments', {
    layout: 'layout/main',
    title: 'Comments',
    user: userViewModel,
    comments: paginatedComments,
    pages,
    currentPage,
    totalPages,
    prevPage,
    nextPage
  });
});


app.get('/comment/new', (req, res) => {
const userViewModel = {
        name: req.session.username,
        isLoggedIn: true
    };

    res.render('comment-new', {
        layout: 'layout/main',
        title: 'New Comment',
        user: userViewModel
    });
});

app.delete('/comment/:id', ensureAuthenticated, (req, res) => {

    const commentId = parseInt(req.params.id, 10);
    const commentIndex = comments.findIndex(c => c.id === commentId);


    //Check if user is author
    const comment = comments[commentIndex];
    if (comment.author !== req.session.username) {
        console.warn(
        `Unauthorized delete attempt: ${req.session.username} tried to delete ${comment.author}'s comment (ID ${commentId})`
        );
        return res.status(403).send('You are not allowed to delete this comment.');
    }

    comments.splice(commentIndex, 1);
    console.log(`Comment with ID ${commentId} deleted by ${req.session.username}`);
    return res.redirect('/comments');
});



app.post('/comment', ensureAuthenticated, (req, res) => {
const { comment } = req.body;

    if (!comment || comment.trim() === '') {
         // Re-render page if comment is empty
         const userViewModel = { name: req.session.username, isLoggedIn: true };
         return res.render('comments', { 
            layout: 'layout/main',
            title: 'Comments',
            user: userViewModel,
            comments: comments, 
            commentError: 'Comment cannot be empty.'
        });
    }

    comments.push({
        id: COMMENT_ID_COUNTER+=1,
        author: req.session.username, 
        text: comment,
        createdAt: new Date().toLocaleTimeString("en-US", {timeZone: 'America/New_York'})    
    });

    res.redirect('/comments');
});


// Logout
app.post('/logout', (req, res) => {
    const username = req.session.username;
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.redirect('/');
            }
            console.log(`User ${username} logged out.`);
            res.redirect('/login');
        });
});


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

