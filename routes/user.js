const express = require("express");
const Router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const User = require("../models/user.js");
const passport = require("passport");

Router.get("/signup",wrapAsync(async (req,res)=>{
    res.render("signup.ejs");
}));

Router.post("/signup",wrapAsync(async (req,res)=>{
    try{
        let {username,email,password} = req.body;
    let newUser = new User({username,email});
    let user = await User.register(newUser,password);
    console.log(user);
    req.flash("success","Welcome to Wanderlust!");
    res.redirect("/listing");
    }catch(e){
        req.flash("error","Username already exists");
        res.redirect("/signup");
    }
    
}));

Router.get("/login",wrapAsync(async (req,res)=>{
    res.render("login.ejs");
}));

Router.post("/login",passport.authenticate('local',{failureRedirect:'/login',failureFlash : true}),wrapAsync(async (req,res)=>{
    req.flash("success","Welcome to Wanderlust!");
    res.redirect("/listing");
}));



module.exports = Router;

