const router=require('express').Router();const controller=require('../controllers/menu.controller');
router.get('/',controller.list);
module.exports=router;