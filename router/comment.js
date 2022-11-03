//Handle comment upload and delete 
const express = require("express")
const router = express.Router()

const {comment, commentDuplicate, commentDelete, commentComment, cCommentDuplicate, testDelete} = require("../controller/comment")

router.route("/comment").post(comment) //handle comment upload
router.route("/duplicate").post(commentDuplicate) //middleware for comment duplicate
router.route("/delete").delete(commentDelete) //Handle Comment Delete
router.route("/cccomment").post(commentComment) //Handle Comment under a comment
router.route("/ccduplicate").post(cCommentDuplicate) //middleware for comment under comment duplicate

router.route("/test").delete(testDelete) //middleware for comment under comment duplicate

module.exports = router