const express = require('express')
const { userRegistration, otpVerify, loginVerification, UserGoolgleLogin, propertyList, propertyDetail } = require('../Controller/userController');
const userRoute = express()

userRoute.post('/signup', userRegistration)
userRoute.post('/otpVerify', otpVerify)
userRoute.post('/userLogin', loginVerification)
userRoute.post('/googleUserLogin', UserGoolgleLogin)
userRoute.get("/propertyList", propertyList)
userRoute.get('/propertyDetails/:propertyId', propertyDetail)

module.exports = userRoute n cmsdmnv';vlkvljlb