const mongoose = require("mongoose");
const PropertyModel = new mongoose.Schema({

    partnerId: {
        type: mongoose.Types.ObjectId,
        ref: "Partner",
        required: true
    },
    propertyStatus: {
        type: Boolean,
        default: false
    },
    propertyFor: {
        type: String,
        required: true
    },
    propertyName: {
        type: String,
        required: true
    },
    propertyType: {
        type: String,
        required: true 
    },
    state: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true
    },
    verificationStatus: { 
        type: String,
        default:"null"
       
    },
    floor: {
        type: Number,

    },
    features:{
        type:Array,
        requried:true
    },
    propertyBHK: {
        type: String,
        required:true
    },
    bathroom: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location:{
        type:String,
        required:true
    },
    Price: {
        type: Number,
        required: true
    },
    propertyImage: {
        type: Array,
        required: true
    },
    personCanStay:{
        type:String,
    },
    square_feet:{
        type:Number,
        requried:true
    },

    bookingDates:[
            {
                startDate:{
                    type:Date,
                },
                endDate:{
                    type:Date,
                },
            },
    ],
},{timestamps:true});
const property=mongoose.model("property",PropertyModel)
module.exports=property