const express = require('express');
const app = express();
const session = require('express-session');
const hbs = require('hbs'); 
const path = require('path');
const PORT = process.env.PORT || 8080;


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
    let user = {
        name: "Guest",
        isLoggedIn: false,
        loginTime: null,
        visitCount: 0
    };

    // Check if user is logged in via session
    if (req.session.isLoggedIn) {
        user = {
            name: req.session.username,
            isLoggedIn: true,
            loginTime: req.session.loginTime,
            visitCount: req.session.visitCount || 0
        };

        // Increment visit count
        req.session.visitCount = (req.session.visitCount || 0) + 1;
    }

    res.render('home', { layout: 'layout/main', title: 'Home', user: user });

});

app.get('/register', (req, res) => {
    res.json({ 
        status: 'register endpoint',
        service: 'nodejs-backend'
    });
});

app.post('/register', (req, res) => {
    res.json({ 
        status: 'register POST endpoint',
        service: 'nodejs-backend'
    });
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

app.get('/login', (req, res) => {
    res.render('login');
});

// Handle login form submission (no session functionality yet)
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Simple authentication (in production, use proper password hashing)
    if (username && password) {
        // Set session data
        req.session.isLoggedIn = true;
        req.session.username = username;
        req.session.loginTime = new Date().toISOString();
        req.session.visitCount = 0;

        console.log(`User ${username} logged in at ${req.session.loginTime}`);
        res.redirect('/');
    } else {
        res.redirect('/login?error=1');
    }
});


app.get('/comments', (req, res) => {
    res.json({ 
        status: 'comments endpoint',
        service: 'nodejs-backend'
    });
});

app.get('/comment/new', (req, res) => {
    res.json({ 
        status: 'new comment endpoint',
        service: 'nodejs-backend'
    });
});

app.post('/comment', (req, res) => {
    res.json({ 
        status: 'comment POST endpoint',
        service: 'nodejs-backend'
    });
});

// Logout route - Add this new route
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log('Error destroying session:', err);
        }
        res.redirect('/');
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});