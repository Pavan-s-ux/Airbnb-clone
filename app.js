const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const ejsMate = require("ejs-mate");

const methodOverride = require('method-override')
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,"public")));

app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.set("view engine","ejs");
app.engine("ejs",ejsMate);

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
async function main(){
    await mongoose.connect(MONGO_URL);
}
main().then(()=>{
    console.log("Connected to DB");
}).catch(err =>{
    console.log(`Error occured while connecting to DB ${err}`);
});

app.get("/listing",async (req,res)=>{
  const allListing = await  Listing.find({});
  res.render("listing.ejs",{allListing});
});
// new route
app.get("/listing/new",(req,res)=>{
    res.render("new.ejs");
});

app.post("/listing",async (req,res)=>{
 let newListing = new Listing(req.body.listing);
 await newListing.save();
 res.redirect("/listing");
});

// show route
app.get("/listing/:id",async (req,res)=>{
  let id = req.params.id;
  let list = await Listing.findById(id);
  console.log(list);
  res.render("list.ejs",{list});
});

// Edit route
app.get("/listing/:id/edit",async (req,res)=>{
    let id = req.params.id;
    let list = await Listing.findById(id);
    res.render("edit.ejs",{list});
});

app.put("/listing/:id",async (req,res)=>{
    let id = req.params.id;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
     res.redirect(`/listing/${id}`);
});

// delete routee
app.delete("/listing/:id",async(req,res)=>{
    let id = req.params.id;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listing");
});

app.listen(3000,()=>{
    console.log(`Server started on port: 3000`);
});