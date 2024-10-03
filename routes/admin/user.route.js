const router = require("express").Router();
const {getPaginatedUser} = require("../../controllers/admin/user.controller")
const { verifyAdmin } = require("../../middleware/auth.middleware");


router.get('/', verifyAdmin, getPaginatedUser);

module.exports = router;