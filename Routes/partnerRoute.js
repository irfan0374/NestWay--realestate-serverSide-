const express=require("express")
const partnerRoutes=express()
const {signup,otpVerification,loginVerification,partnerKycUpload, addProperty,listProperty,detailProperty}=require('../Controller/partnerController')

partnerRoutes.post("/signup",signup)
partnerRoutes.post("/otpVerification",otpVerification)
partnerRoutes.post('/login',loginVerification)
partnerRoutes.patch('/partnerKycUpload',partnerKycUpload)
partnerRoutes.post('/addProperty',addProperty)
partnerRoutes.get('/myProperty/:partnerId',listProperty)
partnerRoutes.get('/propertyDetail/:propertyId',detailProperty)

module.exports=partnerRoutes;