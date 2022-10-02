//Handle comment upload and delete 
const express = require("express")
const router = express.Router()

const {comment, commentDuplicate, commentDelete} = require("../controller/comment")

router.route("/comment").post(comment) //handle comment upload
router.route("/duplicate").post(commentDuplicate) //middleware for comment duplicate
router.route("/delete").delete(commentDelete) //Handle Comment Delete

module.exports = router