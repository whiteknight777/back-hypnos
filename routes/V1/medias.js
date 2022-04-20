const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client')
const Validator = require('validatorjs');
const fs = require('fs');
const path = require('path');
const MediaSchema = require('../../validatorSchema/mediaSchema')
const { Medias } = new PrismaClient()
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      const extension = file.mimetype.split('/')[1]
      cb(null, Date.now() + `.${extension}`)
    }
})
const upload = multer({ storage });

// Config url for static upload
let upload_static;
const {PORT, HOST, NODE_ENV} = process.env;
if (NODE_ENV !== 'production') {
    upload_static = `http://${HOST}:${PORT}/uploads`
}else{
    upload_static = `https://${HOST}/uploads`
}

/**
 * @swagger
 * /medias:
 *   get:
 *     description: Get all medias
 *     tags: [Medias]
 *     responses:
 *       200:
 *         description: Return medias data.
 */
router.get('/', async (req, res) => {
    try {
        const response = await Medias.findMany();
        res.status(200).json({
            '@context': 'Medias',
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
 * /medias/:id:
 *   get:
 *     description: Get one media
 *     tags: [Medias]
 *     responses:
 *       200:
 *         description: Return media data.
 */
router.get('/:id', async (req, res) => {
    const {id} = req.params
    try {
        Medias.findUnique({
            where: {
                id: id
            },
        }).then(media => {
            if (media === null){
                res.status(400).json({
                    message: "media not found..."
                });
            }else{
                res.status(200).json({
                    '@context': 'Medias',
                    data: media,
                    apiVersion: 'V1'
                });
            }
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
 * /medias/:id:
 *   put:
 *     description: update one media
 *     tags: [Medias]
 *     responses:
 *       200:
 *         description: Return media data.
 */
router.put('/:id', upload.single("file"), async (req, res) => {
    const {id} = req.params
    // Get the file
    const { file } = req;
    const extension = file.mimetype.split('/')[1]
    const {
        name,
		roomId,
    } = req.body;
    try {
        const Media = await Medias.findUnique({
            where: {
                id: id
            },
        });
        if(Media){
            const data = {
                name,
                filename: file.filename,
                path: file.path,
                url: `${upload_static}/${file.filename}`,
                roomId,
                extension
            }
            // Validate data
            const validation = new Validator(data, MediaSchema);
            if(validation.passes()){
                // remove previous file
                fs.unlinkSync(Media.path);
                data.updatedAt = new Date();
                Medias.update({
                    where: { id: id },
                    data
                }).then((media) => {
                    res.json({
                        '@context': 'Medias',
                        data: media,
                        apiVersion: 'V1'
                    });
                }).catch(err => {
                    console.error(err);
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
 * /medias/:id:
 *   patch:
 *     description: Patch one media
 *     tags: [Medias]
 *     responses:
 *       200:
 *         description: Return media data.
 */
 router.patch('/:id', async (req, res) => {
    const {id} = req.params
    const {
        isMain,
		isDeleted,
    } = req.body;
    try {
        const Media = await Medias.findUnique({
            where: {
                id: id
            },
        });
        if(Media){
            const data = {
                isMain,
                isDeleted,
                updatedAt: new Date()
            }
            Medias.update({
                where: { id: id },
                data
            }).then((media) => {
                res.json({
                    '@context': 'Medias',
                    data: media,
                    apiVersion: 'V1'
                });
            }).catch(err => {
                console.error(err);
                res.status(400).json({ message: err.message });
            })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /medias/:roomId:
 *   post:
 *     description: Upload new media(s)
 *     tags: [Medias]
 *     responses:
 *       201:
 *         description: Return new media data.
 */
 router.post('/:roomId',  upload.array("files"), async (req, res) => {
    const {roomId} = req.params
    const { files } = req;

	try {
        if(files?.length > 0){
            const dataToSave = []
            const errors = []
            files.forEach(file => {
                const extension = file.mimetype.split('/')[1]
                const newMedia = {
                    name: file.filename,
                    filename: file.filename,
                    path: file.path,
                    url: `${upload_static}/${file.filename}`,
                    roomId,
                    extension,
                    isMain: false,
                    isDeleted: false,
                };
                // Validate data
                const validation = new Validator(newMedia, MediaSchema);
                if(validation.passes()){
                    dataToSave.push(newMedia);
                }else{
                    errors.push({ media: newMedia, error: validation.errors})
                    console.error(validation.errors)
                }
            })
            Medias.createMany({
                data: dataToSave,
                skipDuplicates: true,
            }).then(() => {
                res.status(201).json({
                    '@context': 'Medias',
                    data: { 
                        success_upload: dataToSave.length,
                        failed_upload: {
                            errors,
                            nbError: errors.length
                        }
                    },
                    apiVersion: 'V1'
                });
            }).catch(err => {
                console.error(err);
                res.status(400).json({ message: err.message });
            })
        }
	} catch (e) {
		res.status(400).json({ message: e.message });
	}
});


module.exports = router;
