const express = require("express");
const app = express();

const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require("method-override");
const engine = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');


const reviews = require('./routes/review.js');
const listings = require('./routes/listing.js');

app.engine('ejs', engine); 
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));

main().then(() => {
    console.log("Connected to Database");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

//Root 
app.get("/",(req,res)=>{
    res.send("HI! I AM ROOT");
});

app.get("/privacy",(req,res)=>{
    res.send("Privacy Conditions");
});

app.get("/terms",(req,res)=>{
    res.send("Terms and conditions");
});

const sessionOptions = {
    secret : 'mysupersecretcode',
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next)=>{
    res.locals.success = req.flash('success');
    next();
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);


//For all un-existent routes
//use "/{*any}" instead of "*"  
app.all("/{*any}", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});


//Error Handline MiddleWare
app.use((err,req,res,next)=>{
    let{statusCode=500 , message="Something Went Wrong"} = err;
    res.status(statusCode).render("error",{message});
});

//Start your server
app.listen(3000, () => {
    console.log("Server is listening on port: 3000");
});