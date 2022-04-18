const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client')
const Validator = require('validatorjs');
const MessageSchema = require('../../validatorSchema/messageSchema')
const { Messages } = new PrismaClient()

/**
 * @swagger
 * /messages:
 *   get:
 *     description: Get all messages
 *     tags: [Messages]
 *     responses:
 *       200:
 *         description: Returns messages data.
 */
router.get('/', async (req, res) => {
    try {
        const response = await Messages.findMany({
            select : {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                text: true,
                createdAt: true,
                facility: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                feedBackType: {
                    select: {
                        id: true,
                        title: true,
                    }
                },
            }
        });
        res.status(200).json({
            '@context': 'Messages',
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
 * /messages/:id:
 *   get:
 *     description: Get one message
 *     tags: [Messages]
 *     responses:
 *       200:
 *         description: Return message data.
 */
router.get('/:id', async (req, res) => {
    const {id} = req.params
    try {
        Messages.findUnique({
            where: {
                id: id
            },
            select : {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                text: true,
                createdAt: true,
                facility: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                feedBackType: {
                    select: {
                        id: true,
                        title: true,
                    }
                },
            }
        }).then(message => {
            res.status(200).json({
                '@context': 'Messages',
                data: message,
                apiVersion: 'V1'
            });
        }).catch(error => {
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
 * /messages:
 *   post:
 *     description: Add new message
 *     tags: [Messages]
 *     responses:
 *       201:
 *         description: Return new message data.
 */
 router.post('/', async (req, res) => {
    const {
		firstName,
		lastName,
        email,
		text,
		facilityId,
		feedBackTypeId
	} = req.body;

	try {
		const newMessage = {
            firstName,
            lastName,
            email,
            text,
            facilityId,
            feedBackTypeId
		};
        // Validate data
        const validation = new Validator(newMessage, MessageSchema);
        if(validation.passes()){
            Messages.create({
                data: newMessage
            }).then((message) => {
                res.json({
                    '@context': 'Messages',
                    data: message,
                    apiVersion: 'V1'
                });
            }).catch(err => {
                console.error(err);
                res.status(400).json({ message: err.message });
            })
        }else{
            res.status(400).json({ message: validation.errors });
        }
	} catch (e) {
		res.status(400).json({ message: e.message });
	}
});



module.exports = router;
