const express = require("express");
const Router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js")
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js")


const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((er)=> er.message).join(",");
        throw new ExpressError(400,errMsg);
    }else next();
};


Router.get("/",wrapAsync(async (req,res)=>{
  const allListing = await  Listing.find({});
  res.render("listing.ejs",{allListing});
}));
// new route
Router.get("/new",(req,res)=>{
    res.render("new.ejs");
});

Router.post("/",validateListing, wrapAsync(async (req,res,next)=>{
    let newListing = new Listing(req.body.listing);
     await newListing.save();
     req.flash("success","Listing added succesfully!");
     res.redirect("/listing");
}));

// show route
Router.get("/:id",wrapAsync(async (req,res)=>{
  let id = req.params.id;
  let list = await Listing.findById(id).populate("reviews");
  if(!list){
    req.flash("error","Listing does not exist!");
    return res.redirect("/listing");
  }
  res.render("list.ejs",{list});
}));

// Edit route
Router.get("/:id/edit",validateListing,wrapAsync(async (req,res)=>{
    let id = req.params.id;
    let list = await Listing.findById(id);
    if(!list){
    req.flash("error","Listing does not exist!");
    return res.redirect("/listing");
  }
    res.render("edit.ejs",{list});
}));

Router.put("/:id",wrapAsync(async (req,res)=>{
    let id = req.params.id;
    let list = await Listing.findByIdAndUpdate(id,{...req.body.listing});
     
    req.flash("success","Listing Updated Succesfully!");
     res.redirect(`/listing/${id}`);
}));

// delete routee
Router.delete("/:id",wrapAsync(async(req,res)=>{
    let id = req.params.id;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted Succesfully!");
    res.redirect("/listing");
}));

module.exports = Router;