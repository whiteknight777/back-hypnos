// eslint-disable-next-line
const LocalStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const Users = require('../models/users');
const utils = require('../lib/utils');

const pathTokey = path.join(__dirname, '../keypair/id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathTokey, 'utf8');

// JWT OPTIONS
const options = {
	jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
	secretOrKey: PUB_KEY,
	algorithms: ['RS256'],
};

module.exports = (passport) => {
	// LOGIN strategy
	passport.use(
		'login',
		new LocalStrategy(
			{ usernameField: 'email' },
			async (email, password, done) => {
				Users.findOne({ email }).then((user) => {
					if (!user)
						return done(null, false, { message: "user doesn't exist." });
					// Function defined at bottom of app.js
					const isValid = utils.validPassword(password, user.hash, user.salt);
					if (isValid) return done(null, user);
					return done(null, false, { message: 'Password incorrect' });
				});
			}
		)
	);
	// JWT strategy
	passport.use(
		new JWTstrategy(options, async (jwt_payload, done) => {
			// We will assign the `sub` property on the JWT to the database ID of user
			Users.findOne({ _id: jwt_payload.sub }, (err, user) => {
				if (err) return done(err);
				return done(null, user);
			});
		})
	);
};
