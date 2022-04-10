const express = require('express');
const passport = require('passport');
const utils = require('../../lib/utils');
const router = express.Router();

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
					error: 'email or password incorrect.',
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


module.exports = router;
