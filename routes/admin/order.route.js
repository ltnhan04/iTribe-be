const router = require("express").Router();
const {getPaginatedOrder} = require("../../controllers/admin/order.controller")
const { verifyAdmin } = require("../../middleware/auth.middleware");


router.get('/', verifyAdmin, getPaginatedOrder);


module.exports = router;
