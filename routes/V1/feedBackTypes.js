const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client')
const Validator = require('validatorjs');
const FeedBackTypesFixtures = require('../../fixtures/FeedBackTypes/FeedBackTypesFixtures')
const FeedBackTypeSchema = require('../../validatorSchema/feedBackTypeSchema')
const { FeedBackTypes } = new PrismaClient()

/**
 * @swagger
 * /feedBackTypes:
 *   get:
 *     description: Get all feedBackTypes
 *     tags: [FeedBackTypes]
 *     responses:
 *       200:
 *         description: Returns feedBackTypes data.
 */
router.get('/', async (req, res) => {
    try {
        const response = await FeedBackTypes.findMany();
        res.status(200).json({
            '@context': 'FeedBackTypes',
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
 * /feedBackTypes/:id:
 *   get:
 *     description: Get one feedBackType
 *     tags: [FeedBackTypes]
 *     responses:
 *       200:
 *         description: Return feedBackType data.
 */
router.get('/:id', async (req, res) => {
    const {id} = req.params
    try {
        FeedBackTypes.findUnique({
            where: {
                id: id
            },
        }).then(feedBackType => {
            res.status(200).json({
                '@context': 'FeedBackTypes',
                data: feedBackType,
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
 * /feedBackTypes/:id:
 *   put:
 *     description: update one feedBackType
 *     tags: [FeedBackTypes]
 *     responses:
 *       200:
 *         description: Return feedBackType data.
 */
router.put('/:id', async (req, res) => {
    const {id} = req.params
    const {
        title,
		isDeleted
    } = req.body;
    try {
        const FeedBackType = await FeedBackTypes.findUnique({
            where: {
                id: id
            },
        });
        if(FeedBackType){
            const data = {
                title,
                isDeleted
            }
            // Validate data
            const validation = new Validator(data, FeedBackTypeSchema);
            if(validation.passes()){
                data.updatedAt = new Date();
                FeedBackTypes.update({
                    where: { id: id },
                    data
                }).then((feedBackType) => {
                    res.json({
                        '@context': 'FeedBackTypes',
                        data: feedBackType,
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
 * /feedBackTypes:
 *   post:
 *     description: Add new feedBackType
 *     tags: [FeedBackTypes]
 *     responses:
 *       201:
 *         description: Return new feedBackType data.
 */
 router.post('/', async (req, res) => {
    const {
		title,
		isDeleted
	} = req.body;

	try {
		const newFeedBackType = {
			title,
            isDeleted
		};
        // Validate data
        const validation = new Validator(newFeedBackType, FeedBackTypeSchema);
        if(validation.passes()){
            FeedBackTypes.create({
                data: newFeedBackType
            }).then((feedBackType) => {
                res.json({
                    '@context': 'FeedBackTypes',
                    data: feedBackType,
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
 * /feedBackTypes/fixtures:
 *   post:
 *     description: Add feedBackTypes fixtures
 *     tags: [FeedBackTypes]
 *     responses:
 *       201:
 *         description: Return sucess message.
 */
 router.post('/fixtures', async (req, res) => {
	try {
        // check if data exits
        FeedBackTypes.findMany().then(results => {
            if(results.length > 0) {
                return res.json({ message: `Oups... there are already data on the feedBackTypes table (${results.length})!` });
            }else{
                FeedBackTypes.createMany({
                    data: FeedBackTypesFixtures,
                    skipDuplicates: true,
                }).then(() => {
                    return res.json({ message: "FeedBackTypes fixtures has been created successfully !" });
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
