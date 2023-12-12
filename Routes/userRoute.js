const express = require('express');
const userRoute = express()
const { userTokenVerify } = require('../Middleware/auth');
const { userRegistration, otpVerify, loginVerification, UserGoolgleLogin, propertyDetail, findUser, updateProfile, rentProperty, profileImage, saleProperty, subscription,premiumUpdate,findPartner,contactAgent,allUser,RentData,SalesData,RentForBudget,SalesForBudget,propertyByBhkRent,propertyByBhkSales,PasswordChange,forgotPassword,resetpassword,getThePropertyType,searchFilter } = require('../Controller/userController');

userRoute.post('/signup', userRegistration);
userRoute.post('/otpVerify', otpVerify);
userRoute.post('/userLogin',loginVerification);
userRoute.post('/googleUserLogin', UserGoolgleLogin);
userRoute.get('/propertyDetails/:propertyId', propertyDetail);
userRoute.get('/findUser/:id', userTokenVerify, findUser);
userRoute.patch('/updateProfile', userTokenVerify, updateProfile);
userRoute.get('/rentProperty', rentProperty);
userRoute.patch('/updataImage', userTokenVerify, profileImage);
userRoute.get('/saleProperty', saleProperty);
userRoute.patch('/create-subscription', subscription);
userRoute.patch('/premiumUpdate/:id', premiumUpdate);
userRoute.get('/findPartner/:id', findPartner);
userRoute.post('/sentMailtoAgent', contactAgent);
userRoute.get('/allUser',userTokenVerify, allUser);
userRoute.get('/rentData/:type', RentData);
userRoute.get('/salesData/:type', SalesData);
userRoute.get('/budgetRent/:type', RentForBudget);
userRoute.get('/budgetSales/:type', SalesForBudget);
userRoute.get('/propertyByBhkRent/:type', propertyByBhkRent);
userRoute.get('/propertyByBhkSales/:type', propertyByBhkSales);
userRoute.patch('/passwordChange', PasswordChange);
userRoute.get('/forgotPassword/:email', forgotPassword);
userRoute.patch('/resetPassword/:id/:token', resetpassword);
userRoute.get('/getThePropertyType', getThePropertyType);
userRoute.post('/Search', searchFilter);


module.exports = userRoute;

