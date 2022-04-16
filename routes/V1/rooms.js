const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client')
const Validator = require('validatorjs');
const RoomSchema = require('../../validatorSchema/roomSchema')
const RoomServiceSchema = require('../../validatorSchema/roomServiceSchema')
const { Rooms, RoomServices } = new PrismaClient()

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
               services: {
                    select: {
                        service: true,
                        createdAt: true
                    }
               }, 
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

/**
 * @swagger
 * /rooms/services:
 *   post:
 *     description: Add new services to a room
 *     tags: [Rooms]
 *     responses:
 *       201:
 *         description: Return new room data.
 */
 router.post('/services', async (req, res) => {
    const {
		services
	} = req.body;

	try {
        if(services.length > 0){
            let dataToSave = []
            let errors = []
            services.forEach(service => {
                // Validate data
                const validation = new Validator(service, RoomServiceSchema);
                if(validation.passes()){
                    dataToSave.push(service)
                }else{
                    errors.push({
                        service,
                        error: validation.errors
                    })
                }
            })
            RoomServices.createMany({
                data: dataToSave,
                skipDuplicates: true,
            }).then(() => {
                res.json({
                    '@context': 'RoomServices',
                    data: { 
                        success: dataToSave.length,
                        errors: {
                            errors,
                            nbError: errors.length
                        }
                    },
                    apiVersion: 'V1'
                });
            }).catch(err => {
                console.error(err);
                res.json({ message: err.message });
            })
        }
	} catch (e) {
		res.json({ message: e.message });
	}
});


/**
 * @swagger
 * /rooms/services:
 *   delete:
 *     description: Delete room services
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: Return success message
 */
 router.delete('/services', async (req, res) => {
    const {
		roomId,
        serviceId
	} = req.body;

	try {
        RoomServices.delete({
            where: {
                roomId_serviceId : {
                    roomId, 
                    serviceId
                }
            }
        }).then(() => {
            res.json({ message: "Service has been deleted with success !" });
        }).catch(err => {
            console.error(err);
            res.json({ message: err.message });
        })
	} catch (e) {
		res.json({ message: e.message });
	}
});


module.exports = router;
