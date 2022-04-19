const express = require('express');
const router = express.Router();
const utils = require('../../lib/utils');
const { PrismaClient } = require('@prisma/client')
const Validator = require('validatorjs');
const BookingSchema = require('../../validatorSchema/bookingSchema')
const { Bookings } = new PrismaClient()

/**
 * @swagger
 * /bookings:
 *   get:
 *     description: Get all bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: Returns bookings data.
 */
router.get('/', async (req, res) => {
    try {
        const response = await Bookings.findMany({
            select : {
                id: true,
                startDate: true,
                endDate: true,
                days: true,
                createdAt: true,
                updatedAt: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                    }
                },
                room: {
                    select: {
                        id: true,
                        title: true,
                        facility: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                },
            }
        });
        res.status(200).json({
            '@context': 'Bookings',
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
 * /bookings/:id:
 *   get:
 *     description: Get one booking
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: Return booking data.
 */
router.get('/:id', async (req, res) => {
    const {id} = req.params
    try {
        Bookings.findUnique({
            where: {
                id: id
            },
            select : {
                id: true,
                startDate: true,
                endDate: true,
                days: true,
                createdAt: true,
                updatedAt: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                    }
                },
                room: {
                    select: {
                        id: true,
                        title: true,
                        facility: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                },
            }
        }).then(booking => {
            res.status(200).json({
                '@context': 'Messages',
                data: booking,
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
 * /bookings/:id:
 *   put:
 *     description: update one booking
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: Return booking data.
 */
 router.patch('/:id', async (req, res) => {
    const {id} = req.params
    const {
        isDeleted
    } = req.body;
    try {
        const Booking = await Bookings.findUnique({
            where: {
                id: id
            },
        });
        if(Booking){
            const data = {
                userId: Booking.userId,
                roomId: Booking.roomId,
                startDate: Booking.startDate,
                endDate: Booking.endDate,
                isDeleted
            }
            // CHECK IF startDate - uday >= 3 DAYS 
            const uday = new Date()
            const days = utils.dateDiff(uday, Booking.startDate)
            if(days >= 3){
                data.updatedAt = new Date();
                Bookings.update({
                    where: { id: id },
                    data
                }).then((booking) => {
                    res.json({
                        '@context': 'Bookings',
                        data: booking,
                        apiVersion: 'V1'
                    });
                }).catch(err => {
                    res.status(400).json({ message: err.message });
                })
            }else{
                res.status(400).json({ message: `Oups... mais l'annulation n'est plus possible car la réservation prendra effet dans moins de ${days} jour(s).` });
            }   
        }
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
});


/**
 * @swagger
 * /bookings:
 *   post:
 *     description: Add new booking
 *     tags: [Bookings]
 *     responses:
 *       201:
 *         description: Return new booking data.
 */
 router.post('/', async (req, res) => {
    const {
		userId,
		roomId,
        startDate,
		endDate,
		isDeleted
	} = req.body;

	try {
		const newBooking = {
            userId,
            roomId,
            startDate,
            endDate,
            isDeleted
		};
        // Validate data
        const validation = new Validator(newBooking, BookingSchema);
        if(validation.passes()){
            // CHECK IF START DATE & END DATE ARE OK
            // find the days between the two dates
            const firstDate = utils.parseDate(startDate);
            const secondDate = utils.parseDate(endDate);
            const days = utils.dateDiff(firstDate, secondDate)
            if(days > 0){ 
                const allRoomBookings = await Bookings.findMany({
                    where: {
                        roomId: roomId,
                        isDeleted: false
                    }
                })
                if(allRoomBookings.length > 0){
                    // compare for each booking if the new dates are ok
                    let countSuccess = 0;
                    let countError = 0;
                    allRoomBookings.forEach(booking => {
                        // compare booking date to date to save
                        if( ((firstDate < booking.startDate && firstDate < booking.endDate) &&
                            (secondDate < booking.startDate && secondDate < booking.endDate)) || 
                            ((firstDate > booking.endDate && firstDate > booking.startDate) &&
                            (secondDate > booking.endDate && secondDate > booking.startDate))
                            ){
                                countSuccess++;
                        }else{
                            countError++;
                        }
                    })
                    if(countError === 0){
                        newBooking.days = days
                        newBooking.startDate = firstDate
                        newBooking.endDate = secondDate
                        Bookings.create({
                            data: newBooking
                        }).then((booking) => {
                            res.json({
                                '@context': 'Bookings',
                                data: booking,
                                apiVersion: 'V1'
                            });
                        }).catch(err => {
                            console.error(err);
                            res.status(400).json({ message: err.message });
                        }) 
                    }else{
                        res.status(400).json({ message: "Oups... mais la période saisie pour la réservation n'est pas libre. Veuillez saisir une nouvelle période. " });
                    }
                }else{
                    // add days to booking data
                    newBooking.days = days
                    newBooking.startDate = firstDate
                    newBooking.endDate = secondDate
                    Bookings.create({
                        data: newBooking
                    }).then((booking) => {
                        res.json({
                            '@context': 'Bookings',
                            data: booking,
                            apiVersion: 'V1'
                        });
                    }).catch(err => {
                        console.error(err);
                        res.status(400).json({ message: err.message });
                    })
                }
            }else{
                // BAD Data have been send
                res.status(400).json({ message: "Veuillez saisir une période correct." });
            }
        }else{
            res.status(400).json({ message: validation.errors });
        }
	} catch (e) {
		res.status(400).json({ message: e.message });
	}
});



module.exports = router;
