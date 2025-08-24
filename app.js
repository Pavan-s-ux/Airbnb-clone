const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const ejsMate = require("ejs-mate"); 
const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js")
const {listingSchema,reviewSchema} = require("./schema.js")
const Review = require("./models/review.js");

const methodOverride = require('method-override')
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,"public")));

app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.set("view engine","ejs");
app.engine("ejs",ejsMate);

const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((er)=> er.message).join(",");
        throw new ExpressError(400,errMsg);
    }else next();
};

const validateReview = async(req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((er)=>er.message).join(",");
        throw new ExpressError(400,errMsg);
    }else next();
};

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
async function main(){
    await mongoose.connect(MONGO_URL);
}
main().then(()=>{
    console.log("Connected to DB");
}).catch(err =>{
    console.log(`Error occured while connecting to DB ${err}`);
});

app.get("/",async (req,res)=>{
  res.send("Welcome to Home page");
});

app.get("/listing",wrapAsync(async (req,res)=>{
  const allListing = await  Listing.find({});
  res.render("listing.ejs",{allListing});
}));
// new route
app.get("/listing/new",(req,res)=>{
    res.render("new.ejs");
});

app.post("/listing",validateListing, wrapAsync(async (req,res,next)=>{
    let newListing = new Listing(req.body.listing);
     await newListing.save();
     res.redirect("/listing");
}));

// show route
app.get("/listing/:id",wrapAsync(async (req,res)=>{
  let id = req.params.id;
  let list = await Listing.findById(id).populate("reviews");
  res.render("list.ejs",{list});
}));

// Edit route
app.get("/listing/:id/edit",validateListing,wrapAsync(async (req,res)=>{
    let id = req.params.id;
    let list = await Listing.findById(id);
    res.render("edit.ejs",{list});
}));

app.put("/listing/:id",wrapAsync(async (req,res)=>{
    let id = req.params.id;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
     res.redirect(`/listing/${id}`);
}));

// delete routee
app.delete("/listing/:id",wrapAsync(async(req,res)=>{
    let id = req.params.id;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listing");
}));

// review post route
app.post("/listing/:id/review",validateReview,wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listing/${listing.id}`);
}));

// review delete route

app.delete("/listing/:id/review/:reviewId",wrapAsync(async(req,res)=>{
   let {id,reviewId} = req.params;
   let result = await Listing.findByIdAndUpdate(id,{$pull:{reviews : reviewId}});
   await Review.findByIdAndDelete(reviewId);
   res.redirect(`/listing/${id}`);
}));

app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

app.use((err,req,res,next)=>{
    let {statusCode = 500,message = "Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs",{err});
})

app.listen(3000,()=>{
    console.log(`Server started on port: 3000`);
});