const MenuItem=require('../models/MenuItem');
exports.list=async(_req,res,next)=>{try{const items=await MenuItem.find({isAvailable:true}).sort({category:1,name:1});res.json({success:true,items});}catch(error){next(error);}};
exports.create=async(req,res,next)=>{try{const item=await MenuItem.create(req.body);res.status(201).json({success:true,item});}catch(error){next(error);}};