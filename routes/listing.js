const express = require('express');
const router = express.Router();

const Listing = require("../models/listing.js");
const {listingSchema} = require('../schema.js');
const {isLoggedIn, isOwner, validateListing} = require('../middleware.js');

const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require("../utils/ExpressError.js");



//INDEX ROUTE
router.get("/",wrapAsync( async (req,res,next)=>{
    const allListings = await Listing.find({});
    res.render("listings/index",{allListings});
}));

//NEW ROUTE
router.get("/new",isLoggedIn , (req,res)=>{
    res.render("listings/new");
});

//CREATE ROUTES
router.post("/", isLoggedIn , validateListing , wrapAsync(  async (req,res,next)=> {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash('success','New Listing Saved!');
    res.redirect("/listings");
}));


//NOTE: just put the dynamic routes(like :id) at the bottom of the static ones


//SHOW ROUTE: READ
router.get("/:id",wrapAsync(  async (req,res,next)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
  .populate("owner")   
  .populate({
    path: "reviews",
    populate: {
      path: "author"   
    }
  });

    if(!listing){
        req.flash('error','Oops,Listing Not Found!');
        return res.redirect('/listings');
    }
    res.render("listings/show",{listing});
}));

//EDIT ROUTE
router.get("/:id/edit", isLoggedIn, isOwner , wrapAsync(  async (req,res,next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit",{listing});
}));

//UPDATE ROUTE
router.put("/:id", isLoggedIn , isOwner, validateListing, wrapAsync( async (req,res,next)=>{
    let result = listingSchema.validate(req.body);
    console.log(result);
    if(result.error){
        throw new ExpressError(400, result.error);
    }
    let {id} = req.params;
    await Listing.findByIdAndUpdate( id , req.body.listing, {new:true} );
    req.flash('success','Listing Updated!');
    res.redirect(`/listings/${id}`);
}));

//DELETE ROUTE
router.delete("/:id",isLoggedIn, isOwner, wrapAsync( async (req,res,next)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash('success','Listing Deleted!');
    console.log(deletedListing);
    res.redirect("/listings");
}));

module.exports = router;