const express = require('express');
const {body , validationResult} = require('express-validator');

const router= express.Router();

const User= require('../models/user.model');
const validateUser = require("../utils/validateUser");

// ? pagination
// ? limit, skip

router.get("/", async (req,res)=>{
    try{
        const per_page = req.query.per_page || 2;
        const page = req.query.page || 1;
        const skip = page < 0 ? 0 : (page - 1)*per_page;
        // (page - 1)*per_page

        const users = await User.find().skip(skip).limit(per_page);

        if(!users) return res.status(400).json({msg: "No users found"}) 
        res.status(200).json(users);
    }
    catch(err){
        return res.status(400).json({msg: "Something went wrong!"})
    }
})

router.get("/code/:code", async (req,res)=>{
    try{
        const user = await User.findOne({code: req.params.code});
        if(!user) return res.status(400).json({msg: "User not found"})        
        res.status(200).json(user);
    }
    catch(err){
        return res.status(400).json({msg: "Something went wrong!"})
    }
})


router.post("/", ...validateUser() ,async (req,res)=>{
    try{
        // * Validate
        const errors = validationResult(req);
        if(!errors.isEmpty())
        {
            return res.status(400).json({errors: errors.array()});
        }

        // * Create User
        const doesUserExist= await User.findOne({code: req.body.code})
        if(doesUserExist) return res.status(400).json({msg: "Duplicate code found"})
        const user = await User.create({
            name: req.body.name,
            code: req.body.code,
            active: req.body.active,
            followers: 0
        })

        if(!user) return res.status(400).json({msg: "User not created"})

        //200 ok
        return res.status(200).json(user)
    }
    catch(err){
        return res.status(400).json({msg: "Something went wrong!"})
    }
})

router.delete("/:user_id", async (req,res)=>{
    try{
        const user = await User.findOneAndDelete({ _id: req.params.user_id })
        if(!user) return res.status(404).json({msg: "User not found"})
        res.status(200).json(user)
    }
    catch(err){
        return res.status(400).json({msg: "Something went wrong!"})
    }
})

router.patch("/:user_id", async (req,res)=>{
    try{
        if(!req.body.name) return res.status(400).json({msg: "Name is required"});
        const user = await User.findOneAndUpdate({ 
            _id: req.params.user_id 
        },{
            $set: {
                name: req.body.name,
                active: req.body.active
            }
        },{
            returnOriginal: false
        }
            )
        if(!user) return res.status(404).json({msg: "User not found"})
        res.status(200).json(user)
    }
    catch(err){
        return res.status(400).json({msg: "Something went wrong!"})
    }
})


module.exports = router;