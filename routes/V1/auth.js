const express = require('express');
const passport = require('passport');
const utils = require('../../lib/utils');
const router = express.Router();
const { PrismaClient } = require('@prisma/client')
const { Users } = new PrismaClient()

/**
 * @swagger
 * /auth/login:
 *   post:
 *     description: Login action
 *     tags: [Authentification]
 *     responses:
 *       200:
 *         description: Returns access token.
 */
router.post('/login', async (req, res, next) => {
	passport.authenticate('login', async (err, user) => {
		try {
			if (err || !user) {
				return res.status(401).json({
					success: false,
					error: 'email ou mot de passe incorrect.',
				});
			}

			req.login(user, { session: false }, async (error) => {
				if (error) return next(error);
				const tokenObject = utils.issueJWT(user);
				return res.json({
					success: true,
					accessToken: tokenObject.token,
				});
			});
		} catch (error) {
			return next(error);
		}
	})(req, res, next);
});

/**
 * /auth/logout:
 *   get:
 *     description: Get user informations
 *     tags: [Authentification]
 *     responses:
 *       200:
 *         description: Returns a string informations.
 */
router.get('/logout', (req, res) => {
	req.logout();
	res.json({ message: 'you are logged out' });
});


/**
 * @swagger
 * /auth/profile:
 *   get:
 *     description: Get user informations
 *     tags: [Authentification]
 *     responses:
 *       200:
 *         description: Returns a User object.
 */
 router.get(
	'/profile',
	passport.authenticate('jwt', { session: false }),
	async (req, res) => {
		const { user } = req;
		if (user) {
			try {
				const response = await Users.findUnique({
					where: {
						id: user.id
					}
				});
				delete response.hash;
				delete response.salt;
				return res.status(200).json({
					'@context': 'Users',
					data: response,
					apiVersion: 'V1',
					totalItems: response.length
				});
			} catch (error) {
				return res.status(500).json({ message: error.message });
			}
		}
		return res.status(401).json({
			error: 'user not authenticated',
		});
	}
);


module.exports = router;
