const express=require("express")
const partnerRoutes=express()
const {signup,otpVerification,loginVerification}=require('../Controller/partnerController')

partnerRoutes.post("/signup",signup)
partnerRoutes.post("/otpVerification",otpVerification)
partnerRoutes.post('/login',loginVerification)

module.exports=partnerRoutes;