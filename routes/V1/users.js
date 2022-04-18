const express = require('express');
const router = express.Router();
const utils = require('../../lib/utils');
const { PrismaClient } = require('@prisma/client')
const Validator = require('validatorjs');
const UsersFixtures = require('../../fixtures/Users/UsersFixtures')
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
router.get('/:id', async (req, res) => {
    const {id} = req.params
    try {
        Users.findUnique({
            where: {
                id: id
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
router.put('/:id', async (req, res) => {
    const {id} = req.params
    const {
        email,
		firstName,
		lastName,
		role,
        isDeleted
    } = req.body;
    try {
        const User = await Users.findUnique({
            where: {
                id: id
            },
        });
        if(User){
            const data = {
                email,
                firstName,
                lastName,
                role,
                isDeleted
            }
            // Validate data
            const validation = new Validator(data, UserSchema);
            if(validation.passes()){
                data.updatedAt = new Date();
                Users.update({
                    where: { id: id },
                    data
                }).then((user) => {
                    console.log(`update user ${id} !`)
                    res.json({
                        '@context': 'Users',
                        data: user,
                        apiVersion: 'V1'
                    });
                }).catch(err => {
                    res.status(400).json({ message: err.message });
                })
            }else{
                res.status(400).json({ message: validation.errors });
            }    
        }
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
});

/**
 * @swagger
 * /users/change-password/:id:
 *   patch:
 *     description: change user password
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Return success message.
 */
 router.patch('/change-password/:id', async (req, res) => {
    const {id} = req.params
    const {
        password,
		newPassword,
    } = req.body;
    try {
        let User = await Users.findUnique({
            where: {
                id: id
            },
        });
        if (User !== null) {
            const isValid = utils.validPassword(password, User.hash, User.salt);
            if (isValid) {
                const saltHash = utils.genPassword(newPassword);
                const { salt, hash } = saltHash;
                Users.update({
                    where: { id: id },
                    data: { hash, salt, updatedAt: new Date() }
                }).then(() => {
                    console.log(`update user ${id} password !`)
                    res.status(200).json({
                        message: 'user password had been changed with success.'
                    });
                }).catch(err => {
                    res.json({ message: err.message });
                })
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
		// Store hash in your DB.
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
                res.status(201).json({
                    '@context': 'Users',
                    data: user,
                    apiVersion: 'V1'
                });
            }).catch(err => {
                res.status(400).json({ message: err.meta.target });
            })
        }else{
            res.status(400).json({ message: validation.errors });
        }
	} catch (e) {
		res.status(400).json({ message: e.message });
	}
});

/**
 * @swagger
 * /users/fixtures:
 *   post:
 *     description: Add users fixtures
 *     tags: [Users]
 *     responses:
 *       201:
 *         description: Return sucess message.
 */
 router.post('/fixtures', async (req, res) => {
	try {
        // check if data exits
        Users.findMany().then(results => {
            if(results.length > 0) {
                return res.status(400).json({ message: `Oups... there are already data on the users table (${results.length})!` });
            }else{
                // Store hash in your DB.
                UsersFixtures.forEach(newUser => {
                    const saltHash = utils.genPassword(newUser.password);
                    const { salt, hash } = saltHash;
                    newUser.hash = hash;
                    newUser.salt = salt;
                    delete newUser.password;
                })
                Users.createMany({
                    data: UsersFixtures,
                    skipDuplicates: true,
                }).then(() => {
                    return res.status(201).json({ message: "Users fixtures has been created successfully !" });
                }).catch(err => {
                    console.error(err.message)
                })
            }
        }).catch(err => {
            console.error(err.message)
        })
	} catch (e) {
        console.error(err.message)
	}
});

module.exports = router;
