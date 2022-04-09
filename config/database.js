const mongoose = require('mongoose');

// ### ATLAS CONNECTION
let DB_URI =
	'mongodb+srv://DB_USER:DB_USER_PASS@DB_CLUSTER.bcnan.mongodb.net/DB_NAME?retryWrites=true&w=majority';
let DB_USER = 'rocket-admin';
let DB_USER_PASS = 'od1dzvGIgAEX56rU';
let DB_CLUSTER = 'rocketcluster';
let DB_NAME = 'rocket-crm';

// eslint-disable-next-line
String.prototype.replaceArray = function (find, replace) {
	let replaceString = this;
	for (let i = 0; i < find.length; i++) {
		replaceString = replaceString.replace(find[i], replace[i]);
	}
	return replaceString;
};

const find = [/DB_USER/i, /DB_USER_PASS/i, /DB_CLUSTER/i, /DB_NAME/i];
const replace = [DB_USER, DB_USER_PASS, DB_CLUSTER, DB_NAME];
DB_URI = DB_URI.replaceArray(find, replace);

mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

module.exports = db;
