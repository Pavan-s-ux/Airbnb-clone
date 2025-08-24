const mongoose = require("mongoose");
const Review = require("./review.js");

const listingSchema = new mongoose.Schema({
    title :{
        type : String,
    },
    description :{
        type : String,
    },
    image :{
        type : String,
        default : "https://images.unsplash.com/photo-1754756356063-103a6019f346?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyfHx8ZW58MHx8fHx8",
        set :(v)=>v === "" ? "https://images.unsplash.com/photo-1754756356063-103a6019f346?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyfHx8ZW58MHx8fHx8" : v,
    },
    price :{
        type : Number,
    },
    location :{
        type : String,
    },
    country :{
        type : String,
    },
    reviews : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Review",
        }
    ]
});


listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id : {$in : listing.reviews}})
    }
});

const Listing = mongoose.model("Listing",listingSchema);

module.exports = Listing;