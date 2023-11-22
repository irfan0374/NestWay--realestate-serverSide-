const express = require('express')
const { userRegistration, otpVerify, loginVerification, UserGoolgleLogin, propertyDetail, findUser, updateProfile, rentProperty, saleProperty, profileImage, } = require('../Controller/userController');
const userRoute = express()
const { userTokenVerify } = require("../Middleware/auth")
userRoute.post('/signup', userRegistration)
userRoute.post('/otpVerify', otpVerify)
userRoute.post('/userLogin', loginVerification)
userRoute.post('/googleUserLogin', UserGoolgleLogin)
userRoute.get('/propertyDetails/:propertyId', propertyDetail)
userRoute.get('/findUser/:id',userTokenVerify, findUser)
userRoute.patch('/updateProfile',userTokenVerify, updateProfile)
userRoute.get('/rentProperty', rentProperty)
userRoute.patch('/updataImage',userTokenVerify, profileImage)
userRoute.get('/saleProperty', saleProperty)

module.exports = userRoute; 