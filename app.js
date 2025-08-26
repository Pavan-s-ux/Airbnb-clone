const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate"); 
const ExpressError = require("./utils/ExpressError.js")
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const methodOverride = require('method-override')
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStartergy = require("passport-local");
const User = require("./models/user.js");



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

const sessionOptions = {
    secret : "mysupersecret",
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() * 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    }
};

app.use(session(sessionOptions));
app.use(flash());
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStartergy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",async (req,res)=>{
  res.send("Welcome to Home page");
});

app.use("/listing",listingRouter);
app.use("/listing/:id/review",reviewRouter);
app.use("/",userRouter);


app.get("/demouser",async(req,res)=>{
    let fakeUser = new User({
        username : "Pavan",
        email : "ps7232004@gmail.com",
    });
   let newUser = await User.register(fakeUser,"july232004");
    res.send(newUser);
})



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