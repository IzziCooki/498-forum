const express = require('express');
const app = express();
const session = require('express-session');
const hbs = require('hbs'); 
const path = require('path');
const PORT = process.env.PORT || 8080;

let users = [{ username: 'dean', password: '1234' }]; // Stores { username, password }
let comments = [ // Stores { author, text }
    { author: 'Alice', text: 'Howdy partner!' },
    { author: 'Bob', text: 'This forum is mighty fine.' }
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
//Form data
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    console.log(`${req.method} request for '${req.url}'`);
    next();
});

app.use(session({
    secret: 'your-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Home page - shows static user data
app.get('/', (req, res) => {
    let userViewModel = {
            name: "Guest",
            isLoggedIn: false
            // loginTime: null, // Can add these back if needed
            // visitCount: 0
        };

        // Check session data set during login
        if (req.session.isLoggedIn && req.session.username) {
            userViewModel = {
                name: req.session.username,
                isLoggedIn: true
                // loginTime: req.session.loginTime,
                // visitCount: req.session.visitCount // Make sure to increment elsewhere if using
            };
        }

        res.render('home', {
            layout: 'layout/main',
            title: 'Wild West Forum',
            user: userViewModel // Pass the constructed object
            // comments: comments // Removed comments from home page
        });

});
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
        return res.render('register', {
            // layout: 'layout/main', // If using layout
            title: 'Register',
            error: 'Username and password are required.'
        });
    }

    // *** Check if username already exists ***
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.render('register', {
            // layout: 'layout/main', // If using layout
            title: 'Register',
            error: 'Username already taken. Please choose another.'
        });
    }

    // Add new user
    users.push({ username, password });
    console.log('Registered new user:', username);
    console.log('Current users:', users); // For debugging
    res.redirect('/login');
});

app.get('/register', (req, res) => {
    res.render('register');
});



// Profile page - now requires login
app.get('/profile', (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }

    const user = {
        name: req.session.username,
        loginTime: req.session.loginTime,
        visitCount: req.session.visitCount || 0
    };

    res.render('profile', { user: user });
});

// Login Page (GET)
app.get('/login', (req, res) => {
    if (req.session.isLoggedIn) { // Redirect if already logged in
            return res.redirect('/');
        }
        res.render('login', {
            layout: 'layout/main', // Or remove if standalone
            title: 'Login'
        });
});

// Handle login form submission (no session functionality yet)
app.post('/login', (req, res) => {
    const { username, password } = req.body;

        if (!username || !password) {
            return res.render('login', {
                // layout: 'layout/main', // If using layout
                title: 'Login',
                error: 'Username and password are required.'
            });
        }

        const user = users.find(u => u.username === username);

        if (user && user.password === password) {
            // *** Set multiple properties on req.session ***
            req.session.isLoggedIn = true;
            req.session.username = user.username; // Store the actual username
            // req.session.loginTime = new Date().toISOString(); // Optional
            // req.session.visitCount = 0; // Optional

            console.log(`User ${username} logged in.`);
            res.redirect('/');
        } else {
            res.render('login', {
            // layout: 'layout/main', // If using layout
                title: 'Login',
                error: 'Invalid username or password.'
            });
        }
});

// Profile Page (GET - Requires Login) - Adapt if needed
app.get('/profile', ensureAuthenticated, (req, res) => {
     // Construct view model if needed, or pass session directly if profile.hbs expects it
     const userViewModel = {
        name: req.session.username,
        // loginTime: req.session.loginTime, // Add if needed by profile.hbs
        // visitCount: req.session.visitCount // Add if needed by profile.hbs
    };
    res.render('profile', {
        layout: 'layout/main',
        title: 'Profile',
        user: userViewModel // Pass the constructed object
        // Or directly: username: req.session.username
    });
});


app.get('/comments', ensureAuthenticated, (req, res) => {
    const userViewModel = {
            name: req.session.username,
            isLoggedIn: true
        };
        res.render('comments', { // Ensure comments.hbs exists
            layout: 'layout/main',
            title: 'Comments',
            user: userViewModel,
            comments: comments // *** Pass the GLOBAL comments array ***
        });
});

app.get('/comment/new', (req, res) => {
const userViewModel = {
        name: req.session.username,
        isLoggedIn: true
    };
    // Ensure you have a 'comment-new.hbs' view file
    res.render('comment-new', {
        layout: 'layout/main', // Or your specific layout if different
        title: 'New Comment',
        user: userViewModel
        // Pass any error message if redirecting back here on POST error
        // commentError: req.query.error // Example if using query params
    });
});

app.post('/comment', ensureAuthenticated, (req, res) => {
const { comment } = req.body; // Get text from form field named 'comment'

    // Basic validation
    if (!comment || comment.trim() === '') {
         // Re-render the page where the form is (e.g., '/comments') with an error
         const userViewModel = { name: req.session.username, isLoggedIn: true };
         return res.render('comments', { // Assuming form is on comments page
            layout: 'layout/main',
            title: 'Comments',
            user: userViewModel,
            comments: comments, // Still need to pass comments when re-rendering
            commentError: 'Comment cannot be empty.' // Pass error message
        });
    }

    // *** Add the new comment object to the GLOBAL comments array ***
    comments.push({
        author: req.session.username, // Get author username from session
        text: comment,
        createdAt: new Date()        // Add timestamp
    });

    console.log(`New comment added by ${req.session.username}`);
    res.redirect('/comments'); // Redirect back to the comments page to show the updated list
});

// Logout route - Add this new route
app.post('/logout', (req, res) => {
    const username = req.session.username; // Get username before destroying
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

