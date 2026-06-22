const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mapToken && mapToken.startsWith("pk.")
  ? mbxGeocoding({ accessToken: mapToken })
  : null;

const DEFAULT_GEOMETRY = {
  type: "Point",
  coordinates: [78.9629, 20.5937],
};



module.exports.index = async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs",{allListings});
};

module.exports.renderNewForm = (req,res)=>{  
    res.render("./listings/new.ejs");
};

module.exports.showListing = async(req,res)=>{
   let {id} = req.params;
   const listing = await  Listing.findById(id)
   .populate({path:"reviews",populate:{path:"author"}})
   .populate("owner");

    if(!listing){
        req.flash("error","Listing you requested for does not exist! ");
       return res.redirect("/listings");
    }
    // console.log(listing);
   res.render("./listings/show.ejs",{listing});
};

module.exports.createListing = async(req,res,next)=>{

  let geometry = DEFAULT_GEOMETRY;
  if (geocodingClient) {
    try {
      const response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      }).send();

      if (response.body.features && response.body.features.length) {
        geometry = response.body.features[0].geometry;
      }
    } catch (error) {
      console.log("Geocoding failed, using fallback coordinates", error.message);
    }
  }

    const uploadedFile = req.file;
    const url = uploadedFile
      ? `data:${uploadedFile.mimetype};base64,${uploadedFile.buffer.toString("base64")}`
      : "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80";
    const filename = uploadedFile ? uploadedFile.originalname : "default-listing-image";

    const newListing =  new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    newListing.geometry = geometry;

    let saveListing = await newListing.save();
    console.log(saveListing);
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
    
};

module.exports.renderEditForm =async(req,res)=>{
     let {id} = req.params;
   const listing = await Listing.findById(id);

 if(!listing){
        req.flash("error","Listing you requested for does not exist! ");
       return res.redirect("/listings");
    }

    let orignalImageUrl = listing.image.url;
    orignalImageUrl = orignalImageUrl.replace("/upload","/upload/h_300,w_250");

   res.render("./listings/edit.ejs",{listing,orignalImageUrl});
};

module.exports.updateListing = async(req,res)=>{
    let {id} =req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file !== "undefined"){
    let url = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    let filename = req.file.originalname;
    listing.image = {url,filename};
    await listing.save();
    }

    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req,res)=>{
     let {id} =req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};
