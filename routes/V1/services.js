const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client')
const Validator = require('validatorjs');
const ServicesFixtures = require('../../fixtures/Services/ServicesFixtures')
const ServiceSchema = require('../../validatorSchema/serviceSchema')
const { Services } = new PrismaClient()

/**
 * @swagger
 * /services:
 *   get:
 *     description: Get all services
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Returns services data.
 */
router.get('/', async (req, res) => {
    try {
        const response = await Services.findMany();
        res.status(200).json({
            '@context': 'Services',
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
 * /services/active:
 *   get:
 *     description: Get all active services
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Returns services data.
 */
 router.get('/active', async (req, res) => {
    try {
        const response = await Services.findMany({
            orderBy: [{title: 'asc'}],
            where: {
                isDeleted: {
                    equals: false,
                }
            }
        });
        res.status(200).json({
            '@context': 'Services',
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
 * /services/:id:
 *   get:
 *     description: Get one service
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Return service data.
 */
router.get('/:id', async (req, res) => {
    const {id} = req.params
    try {
        Services.findUnique({
            where: {
                id: id
            },
        }).then(service => {
            res.json({
                '@context': 'Services',
                data: service,
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
 * /services/:id:
 *   put:
 *     description: update one service
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Return services data.
 */
router.put('/:id', async (req, res) => {
    const {id} = req.params
    const {
        title,
		isDeleted
    } = req.body;
    try {
        const Service = await Services.findUnique({
            where: {
                id: id
            },
        });
        if(Service){
            const data = {
                title,
                isDeleted
            }
            // Validate data
            const validation = new Validator(data, ServiceSchema);
            if(validation.passes()){
                data.updatedAt = new Date();
                Services.update({
                    where: { id: id },
                    data
                }).then((service) => {
                    res.json({
                        '@context': 'Services',
                        data: service,
                        apiVersion: 'V1'
                    });
                }).catch(err => {
                    res.status(400).json({ message: err.message });
                })
            }else{
                console.error(validation.errors);
                res.status(400).json({ message: validation.errors });
            }    
        }
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
});

/**
 * @swagger
 * /services:
 *   post:
 *     description: Add new service
 *     tags: [Services]
 *     responses:
 *       201:
 *         description: Return new service data.
 */
 router.post('/', async (req, res) => {
    const {
		title,
		isDeleted
	} = req.body;

	try {
		const newService = {
			title,
            isDeleted
		};
        // Validate data
        const validation = new Validator(newService, ServiceSchema);
        if(validation.passes()){
            Services.create({
                data: newService
            }).then((service) => {
                res.status(201).json({
                    '@context': 'Services',
                    data: service,
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
 * /services/fixtures:
 *   post:
 *     description: Add services fixtures
 *     tags: [Services]
 *     responses:
 *       201:
 *         description: Return sucess message.
 */
 router.post('/fixtures', async (req, res) => {
	try {
        // check if data exits
        Services.findMany().then(results => {
            if(results.length > 0) {
                return res.json({ message: `Oups... there are already data on the services table (${results.length})!` });
            }else{
                Services.createMany({
                    data: ServicesFixtures,
                    skipDuplicates: true,
                }).then(() => {
                    return res.json({ message: "Services fixtures has been created successfully !" });
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
