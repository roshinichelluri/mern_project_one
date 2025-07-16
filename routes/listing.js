const express = require('express');
const router = express.Router();

const Listing = require("../models/listing.js");
const {listingSchema} = require('../schema.js');

const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require("../utils/ExpressError.js");


//Validating Listing
const validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(404, error.message);
    }else{
        next();
    }
}

//INDEX ROUTE
router.get("/",wrapAsync( async (req,res,next)=>{
    const allListings = await Listing.find({});
    res.render("listings/index",{allListings});
}));

//NEW ROUTE
router.get("/new", (req,res)=>{
    res.render("listings/new");
});

//CREATE ROUTES
router.post("/", validateListing , wrapAsync(  async (req,res,next)=> {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));


//NOTE: just put the dynamic routes(like :id) at the bottom of the static ones


//SHOW ROUTE: READ
router.get("/:id",wrapAsync(  async (req,res,next)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show",{listing});
}));

//EDIT ROUTE
router.get("/:id/edit",wrapAsync(  async (req,res,next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit",{listing});
}));

//UPDATE ROUTE
router.put("/:id", validateListing, wrapAsync( async (req,res,next)=>{
    let result = listingSchema.validate(req.body);
    console.log(result);
    if(result.error){
        throw new ExpressError(400, result.error);
    }
    let {id} = req.params;
    await Listing.findByIdAndUpdate( id , req.body.listing, {new:true} );
    res.redirect("/listings");
}));

//DELETE ROUTE
router.delete("/:id",wrapAsync( async (req,res,next)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

module.exports = router;