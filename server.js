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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/**
 * -------------- API REST V1 ----------------
 */
const authRouter = require('./routes/V1/auth');
const usersRouter = require('./routes/V1/users');
const facilitiesRouter = require('./routes/V1/facilities');
const roomsRouter = require('./routes/V1/rooms');
const mediasRouter = require('./routes/V1/medias');
const servicesRouter = require('./routes/V1/services');
const feedBackTypesRouter = require('./routes/V1/feedBackTypes');
const messagesRouter = require('./routes/V1/messages');
const bookingsRouter = require('./routes/V1/bookings');

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/facilities', facilitiesRouter);
app.use('/rooms', roomsRouter);
app.use('/medias', mediasRouter);
app.use('/services', servicesRouter);
app.use('/feedBackTypes', feedBackTypesRouter);
app.use('/messages', messagesRouter);
app.use('/bookings', bookingsRouter);

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
