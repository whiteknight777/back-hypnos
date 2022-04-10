if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();

// APP PORT
const {PORT, HOST} = process.env;
const AccessLink = `${HOST}:${PORT}`

// Allows our React application to make HTTP requests to Express application
const corsOptions = {
  credentials: true,
  methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH'],
  origin: (origin, callback) => {
      callback(null, true)
  }
}
app.use(cors(corsOptions));


// PASSPORT CONFIG
const passport = require('passport');
const initializePassport = require('./config/passport');
initializePassport(passport);
app.use(passport.initialize());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/**
 * -------------- API REST V1 ----------------
 */
const authRouter = require('./routes/V1/auth');
const usersRouter = require('./routes/V1/users');

app.use('/auth', authRouter);
app.use('/users', usersRouter);

/**
 * -------------- API VIEWS ----------------
 */
const homeRouter = require('./routes/home');
app.use('/', homeRouter); // API DOCUMENTATION

// Server listens on http://localhost:3006
app.listen(PORT || 8000, () => {
	console.log(`Listening on ${PORT}`)
	console.log(`Dashboard: ${AccessLink}`)
});
