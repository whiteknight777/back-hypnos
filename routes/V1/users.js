const express = require('express');
const router = express.Router();
const utils = require('../../lib/utils');
const { PrismaClient } = require('@prisma/client')
const Validator = require('validatorjs');
const UserSchema = require('../../validatorSchema/userSchema')
const { Users } = new PrismaClient()
// Models

/**
 * @swagger
 * /users:
 *   get:
 *     description: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Returns users data.
 */
router.get('/', async (req, res) => {
    try {
        const response = await Users.findMany();
        res.status(200).json({
            '@context': 'Users',
            data: response,
            apiVersion: 'V1',
            totalItems: response.length,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /users/:id:
 *   get:
 *     description: Get one user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Return user data.
 */
router.get('/:_id', async (req, res) => {
    const {_id} = req.params
    try {
        Users.findUnique({
            where: {
                id: _id
            },
        }).then(user => {
            if (user === null){
                res.status(400).json({
                    message: "user not found..."
                });
            }else{
                res.status(200).json({
                    '@context': 'Users',
                    data: user,
                    apiVersion: 'V1'
                });
            }
        }).catch(error => {
            console.log(error.status)
            res.status(400).json({
                message: error.message
            });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /users/:id:
 *   put:
 *     description: update one user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Return user data.
 */
router.put('/:_id', async (req, res) => {
    const {_id} = req.params
    const {
        username,
		email,
		firstname,
		lastname,
		fullname,
		roles,
		pic,
		company,
		language,
		timeZone,
    } = req.body;
    try {
        let User = await Users.findById(_id)
        .exec();
        if(User){
            User.username = username;
            User.email = email;
            User.firstname = firstname;
            User.lastname = lastname;
            User.fullname = User.getFullname();
            User.roles = roles;
            User.pic = pic;
            User.company = company;
            User.language = language;
            User.timeZone = timeZone;
            User.updatedAt = new Date().getTime();
    
            User.save((err, doc) => {
                if (err) return console.error(err);
                res.json({
                    '@context': 'Users',
                    data: User,
                    apiVersion: 'V1'
                });
            });
        }
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
});

/**
 * @swagger
 * /users/change-password:
 *   patch:
 *     description: change user password
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Return success message.
 */
 router.patch('/change-password', async (req, res) => {
    const {
        _id,
        password,
		newPassword,
    } = req.body;
    try {
        let User = await Users.findById(_id);
        if (User !== null) {
            const isValid = utils.validPassword(password, User.hash, User.salt);
            if (isValid) {
                const saltHash = utils.genPassword(newPassword);
                const { salt, hash } = saltHash;
                User.hash = hash;
                User.salt = salt;
                User.updatedAt = new Date().getTime();
        
                User.save((err, doc) => {
                    if (err) return console.error(err);
                    res.status(200).json({
                        message: 'user password had been changed with success.'
                    });
                });
            }else{
                res.status(400).json({ message: 'oups... wrong password' });
            }
        }
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
});

/**
 * @swagger
 * /users/registration:
 *   post:
 *     description: Add new user
 *     tags: [Users]
 *     responses:
 *       201:
 *         description: Return new user data.
 */
 router.post('/registration', async (req, res) => {
    const {
		email,
		firstName,
		lastName,
		password,
		role,
	} = req.body;

	try {
		// Store hash in your password DB.
		const saltHash = utils.genPassword(password);
		const { salt, hash } = saltHash;
		const newUser = {
			email,
			firstName,
			lastName,
			role,
			hash,
			salt
		};
        // Validate data
        const validation = new Validator(newUser, UserSchema);
        if(validation.passes()){
            Users.create({
                data: newUser
            }).then((user) => {
                console.log('new user created !')
                res.json({
                    '@context': 'Users',
                    data: user,
                    apiVersion: 'V1'
                });
            }).catch(err => {
                console.error(err);
                res.json({ message: err.message });
            })
        }else{
            res.json({ message: validation.errors });
        }
	} catch (e) {
		res.json({ message: e.message });
	}
});

module.exports = router;
