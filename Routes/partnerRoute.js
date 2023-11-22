const express = require("express")
const partnerRoutes = express()
const { signup, otpVerification, loginVerification, partnerKycUpload, addProperty, listProperty, detailProperty } = require('../Controller/partnerController')
const { partnerTokenVerified } = require("../Middleware/auth")
partnerRoutes.post("/signup", signup)
partnerRoutes.post("/otpVerification", otpVerification)
partnerRoutes.post('/login', loginVerification)
partnerRoutes.patch('/partnerKycUpload', partnerKycUpload)
partnerRoutes.post('/addProperty', partnerTokenVerified, addProperty)
partnerRoutes.get('/myProperty/:partnerId', partnerTokenVerified, listProperty)
partnerRoutes.get('/propertyDetail/:propertyId', partnerTokenVerified, detailProperty)

module.exports = partnerRoutes; 