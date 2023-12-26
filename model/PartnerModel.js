  const mongoose = require("mongoose");

const PartnerModel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  kycimage:{
    type:String,
    
  },
  profile:{
    type:String
  },
  adminApproved: {
   type:String,
   
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  aboutMe:{
    state:{
      type:String
    },
    location:{
      type:String
    },
    description:{
      type:String
    }

  },
  
  isBlocked: {
    type: Boolean,
    default: false,
  },
},{timestamps:true});

const partnerSchema = mongoose.model('Partner', PartnerModel);

module.exports = partnerSchema;
