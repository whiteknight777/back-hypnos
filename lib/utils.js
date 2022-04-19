const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const pathToKey = path.join(__dirname, '../keypair/id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');

/**
 * -------------- HELPER FUNCTIONS ----------------
 */

/**
 *
 * @param {*} password - The plain text password
 * @param {*} hash - The hash stored in the database
 * @param {*} salt - The salt stored in the database
 *
 * This function uses the crypto library to decrypt the hash using the salt and then compares
 * the decrypted hash/salt with the password that the user provided at login
 */
function validPassword(password, hash, salt) {
	var hashVerify = crypto
		.pbkdf2Sync(password, salt, 10000, 64, 'sha512')
		.toString('hex');
	return hash === hashVerify;
}

/**
 *
 * @param {*} password - The password string that the user inputs to the password field in the register form
 *
 * This function takes a plain text password and creates a salt and hash out of it.  Instead of storing the plaintext
 * password in the database, the salt and hash are stored for security
 *
 * ALTERNATIVE: It would also be acceptable to just use a hashing algorithm to make a hash of the plain text password.
 * You would then store the hashed password in the database and then re-hash it to verify later (similar to what we do here)
 */
function genPassword(password) {
	var salt = crypto.randomBytes(32).toString('hex');
	var genHash = crypto
		.pbkdf2Sync(password, salt, 10000, 64, 'sha512')
		.toString('hex');

	return {
		salt: salt,
		hash: genHash,
	};
}

/**
 * @param {*} user - The user object.  We need this to set the JWT `sub` payload property to the MongoDB user ID
 */
function issueJWT(user) {
	const id = user.id;

	const expiresIn = '60';

	const payload = {
		sub: id,
		iat: Date.now(),
	};

	const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, {
		expiresIn: expiresIn,
		algorithm: 'RS256',
	});

	return {
		token: signedToken,
		expires: expiresIn,
	};
}

/**
 * @param {*} dateString - The Date string to format to Date object.
 */
function parseDate(dateString) {
    var mdy = dateString.split('/');
    return new Date(parseInt(mdy[2]), parseInt(mdy[1])-1, parseInt(mdy[0])); // YYYY/MM-1/DD
}

/**
 * @param {*} firstDate - The first date to compare.
 * @param {*} secondDate - The second date to compare
 */
function dateDiff(firstDate, secondDate) {
    // Take the difference between the dates and divide by milliseconds per day.
    // Round to nearest whole number to deal with DST.
    return Math.round((secondDate - firstDate)/(1000*60*60*24));
}

/**
 * @param {*} firstDate - The first date to compare.
 * @param {*} secondDate - The second date to compare
 */
 function compareDates(firstDate, secondDate) {
    return firstDate > secondDate;
}

/**
 * @param {*} baseDate - Date to use for operation
 * @param {*} nbDay - Number of day before.
 */
 function getPreviousDate(baseDate, nbDay) {
	const day = baseDate.getDate();
	const previousTimeStamp = baseDate.setDate(day + nbDay);
    return new Date(previousTimeStamp);
}

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT;
module.exports.parseDate = parseDate;
module.exports.dateDiff = dateDiff;
module.exports.compareDates = compareDates;
module.exports.getPreviousDate = getPreviousDate;
