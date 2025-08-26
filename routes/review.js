const express = require("express");
const Router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapAsync.js")
const {reviewSchema} = require("../schema.js")
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js")
const Listing = require("../models/listing.js");


const validateReview = async(req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((er)=>er.message).join(",");
        throw new ExpressError(400,errMsg);
    }else next();
};


// review post route
Router.post("/",validateReview,wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","Review Added Succesfully!");
    res.redirect(`/listing/${listing.id}`);
}));

// review delete route

Router.delete("/:reviewId",wrapAsync(async(req,res)=>{
   let {id,reviewId} = req.params;
   let result = await Listing.findByIdAndUpdate(id,{$pull:{reviews : reviewId}});
   await Review.findByIdAndDelete(reviewId);
   req.flash("success","Review Deleted Succesfully!");
   res.redirect(`/listing/${id}`);
}));

module.exports = Router;