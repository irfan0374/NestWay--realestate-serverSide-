const express=require('express')
const { userRegistration,otpVerify,loginVerification,UserGoolgleLogin} = require('../Controller/userController');
const userRoute=express()

userRoute.post('/signup',userRegistration)
userRoute.post('/otpVerify',otpVerify)
userRoute.post('/userLogin',loginVerification)
userRoute.post('/googleUserLogin',UserGoolgleLogin)

module.exports=userRoute 