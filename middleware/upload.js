const multer = require("multer")
const sharp = require("sharp")

const multerStorage = multer.memoryStorage() //store files in the memory

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith("image")) cb(null, true) //check if file is an image and return callback if it is an image 
    else throw new Error("File format is not supported")
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

const resizePhoto = async(req, res, next) => {
    if(!req.file) return next() //if no file go the the next middleware
    // req.file.filename = `User.jpeg`
    await sharp(req.file.buffer)
    .resize(500, 500) //fixed for images
    .toFormat("jpeg")
    .jpeg({
        quality: 90
    })
    .toFile(`public/${req.file.filename}`) //location to save the file

    next() //go to next middleware
}

module.exports = {
    upload,
    resizePhoto
}