const express = require('express');
const router = express.Router();
const utils = require('../../lib/utils');
const { PrismaClient } = require('@prisma/client')
const Validator = require('validatorjs');
const RoomSchema = require('../../validatorSchema/roomSchema')
const { Rooms } = new PrismaClient()

/**
 * @swagger
 * /rooms:
 *   get:
 *     description: Get all rooms
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: Returns rooms data.
 */
router.get('/', async (req, res) => {
    try {
        const response = await Rooms.findMany({
            include : {
               services: true, 
            }
        });
        res.status(200).json({
            '@context': 'Rooms',
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
 * /rooms/:id:
 *   get:
 *     description: Get one room
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: Return room data.
 */
router.get('/:id', async (req, res) => {
    const {id} = req.params
    try {
        Rooms.findUnique({
            where: {
                id: id
            },
        }).then(room => {
            if (room === null){
                res.status(400).json({
                    message: "room not found..."
                });
            }else{
                res.status(200).json({
                    '@context': 'Rooms',
                    data: room,
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
 * /rooms/:id:
 *   put:
 *     description: update one room
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: Return rooms data.
 */
router.put('/:id', async (req, res) => {
    const {id} = req.params
    const {
        title,
		description,
		price,
        facilityId,
		isDeleted
    } = req.body;
    try {
        const Room = await Rooms.findUnique({
            where: {
                id: id
            },
        });
        if(Room){
            const data = {
                title,
                description,
                price,
                facilityId,
                isDeleted
            }
            // Validate data
            const validation = new Validator(data, RoomSchema);
            if(validation.passes()){
                data.updatedAt = new Date();
                Rooms.update({
                    where: { id: id },
                    data
                }).then((room) => {
                    console.log(`update room ${id} !`)
                    res.json({
                        '@context': 'Rooms',
                        data: room,
                        apiVersion: 'V1'
                    });
                }).catch(err => {
                    console.error(err);
                    res.json({ message: err.message });
                })
            }else{
                console.error(validation.errors);
                res.json({ message: validation.errors });
            }    
        }
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
});

/**
 * @swagger
 * /rooms:
 *   post:
 *     description: Add new room
 *     tags: [Rooms]
 *     responses:
 *       201:
 *         description: Return new room data.
 */
 router.post('/', async (req, res) => {
    const {
		title,
		description,
		price,
        facilityId,
		isDeleted
	} = req.body;

	try {
		const newRoom = {
			title,
            description,
            price,
            facilityId,
            isDeleted
		};
        // Validate data
        const validation = new Validator(newRoom, RoomSchema);
        if(validation.passes()){
            Rooms.create({
                data: newRoom
            }).then((room) => {
                console.log('new room created !')
                res.json({
                    '@context': 'Rooms',
                    data: room,
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
