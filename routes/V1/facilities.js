const express = require('express');
const router = express.Router();
const utils = require('../../lib/utils');
const { PrismaClient } = require('@prisma/client')
const Validator = require('validatorjs');
const FacilitiesFixtures = require('../../fixtures/Facilities/FacilitiesFixtures')
const FacilitySchema = require('../../validatorSchema/facilitySchema')
const { Facilities, Rooms } = new PrismaClient()
// Models

/**
 * @swagger
 * /facilities:
 *   get:
 *     description: Get all facilities
 *     tags: [Facilities]
 *     responses:
 *       200:
 *         description: Returns facilities data.
 */
router.get('/', async (req, res) => {
    try {
        const response = await Facilities.findMany({
            orderBy: [{name: 'asc'}],
            select : {
                id: true,
                name: true,
                city: true,
                address: true,
                description: true,
                isDeleted: true,
                createdAt: true,
                updatedAt: true,
                gerant: {
                    select: {
                        id: true,
                        email: true,
                        lastName: true,
                        firstName: true,
                    },
                }, 
            }
        });
        res.status(200).json({
            '@context': 'Facilities',
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
 * /facilities/active:
 *   get:
 *     description: Get all active facilities
 *     tags: [Facilities]
 *     responses:
 *       200:
 *         description: Returns facilities data.
 */
 router.get('/active', async (req, res) => {
    try {
        const response = await Facilities.findMany({
            orderBy: [{name: 'asc'}],
            where: {
                isDeleted: {
                    equals: false,
                }
            }
        });
        res.status(200).json({
            '@context': 'Facilities',
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
 * /facilities/gerant/:gerantId:
 *   get:
 *     description: Get the gerant facility
 *     tags: [Facilities]
 *     responses:
 *       200:
 *         description: Return one facility data.
 */
router.get('/gerant/:gerantId', async (req, res) => {
    const {gerantId} = req.params
    try {
        Facilities.findUnique({
            where: {
                gerantId: gerantId
            },
            include : {
                rooms: {
                    include: {
                        services: {
                            select: {
                                service: true,
                                createdAt: true
                            }
                        },
                        medias: true,
                    },
                }, 
            }
        }).then(facility => {
                res.status(200).json({
                    '@context': 'Facilities',
                    data: facility,
                    apiVersion: 'V1'
                });
        }).catch(error => {
            console.log(error.message)
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
 * /facilities/:id:
 *   get:
 *     description: Get one facility
 *     tags: [Facilities]
 *     responses:
 *       200:
 *         description: Return facility data.
 */
 router.get('/:id', async (req, res) => {
    const {id} = req.params
    try {
        Facilities.findUnique({
            where: {
                id: id
            },
            include : {
                rooms: {
                    include: {
                        services: {
                            select: {
                                service: true,
                                createdAt: true
                            }
                        },
                        medias: true,
                    },
                }, 
            }
        }).then(facility => {
                res.status(200).json({
                    '@context': 'Facilities',
                    data: facility,
                    apiVersion: 'V1'
                });
        }).catch(error => {
            console.log(error.message)
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
 * /facilities/:id:
 *   put:
 *     description: update one facility
 *     tags: [Facilities]
 *     responses:
 *       200:
 *         description: Return facility data.
 */
router.put('/:id', async (req, res) => {
    const {id} = req.params
    const {
        name,
		city,
		address,
		description,
        gerantId,
		isDeleted
    } = req.body;
    try {
        const Facility = await Facilities.findUnique({
            where: {
                id: id
            },
        });
        if(Facility){
            const data = {
                name,
                city,
                address,
                description,
                gerantId,
                isDeleted
            }
            // Validate data
            const validation = new Validator(data, FacilitySchema);
            if(validation.passes()){
                data.updatedAt = new Date();
                Facilities.update({
                    where: { id: id },
                    data
                }).then((facility) => {
                    res.json({
                        '@context': 'Facilities',
                        data: facility,
                        apiVersion: 'V1'
                    });
                }).catch(err => {
                    console.error(err);
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
 * /facilities:
 *   post:
 *     description: Add new facility
 *     tags: [Facilities]
 *     responses:
 *       201:
 *         description: Return new facility data.
 */
 router.post('/', async (req, res) => {
    const {
		name,
		city,
		address,
		description,
        gerantId,
		isDeleted
	} = req.body;

	try {
		const newFacility = {
			name,
            city,
            address,
            description,
            gerantId,
            isDeleted
		};
        // Validate data
        const validation = new Validator(newFacility, FacilitySchema);
        if(validation.passes()){
            Facilities.create({
                data: newFacility
            }).then((user) => {
                res.json({
                    '@context': 'Facilities',
                    data: user,
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

/**
 * @swagger
 * /facilities/fixtures:
 *   post:
 *     description: Add facilities fixtures
 *     tags: [Facilities]
 *     responses:
 *       201:
 *         description: Return sucess message.
 */
 router.post('/fixtures', async (req, res) => {
	try {
        // check if data exits
        Facilities.findMany().then(results => {
            if(results.length > 0) {
                return res.status(400).json({ message: `Oups... there are already data on the facilities table (${results.length})!` });
            }else{
                FacilitiesFixtures.forEach(facility => {
                    const {rooms} = facility;
                    delete facility.rooms
                    Facilities.create({
                        data: facility
                    }).then((newFacility) => {
                        // Add rooms 
                        rooms.forEach(room => {
                            room.facilityId = newFacility.id
                        })
                        Rooms.createMany({
                            data: rooms,
                            skipDuplicates: true,
                        }).then(() => {
                            return res.status(201).json({ message: "Facilities fixtures has been created successfully !" });
                        }).catch(err => {
                            console.error(err.message)
                        })
                    }).catch(err => {
                        console.error(err.message)
                    })
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
