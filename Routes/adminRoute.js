const express = require('express')
const adminRoute = express()
const { adminTokenVerified } = require('../Middleware/auth');

const { adminVerification, userList, partnerList, partnerBlock, userBlock, findPartner, kycApproval, getProperty, findProperty, approvalProperty } = require('../Controller/adminController')

adminRoute.post('/adminLogin', adminVerification)
adminRoute.get('/listUser', adminTokenVerified, userList)
adminRoute.get('/listPartner', partnerList)
adminRoute.patch('/partnerBlock', adminTokenVerified, partnerBlock)
adminRoute.patch('/userBlock', adminTokenVerified, userBlock)
adminRoute.get('/getPartner/:partnerId', adminTokenVerified, findPartner)
adminRoute.patch('/kycApproval', adminTokenVerified, kycApproval)
adminRoute.get('/getProperty',adminTokenVerified, getProperty)
adminRoute.get('/findProperty/:propertyId', adminTokenVerified, findProperty)
adminRoute.patch('/propertyApproval', adminTokenVerified, approvalProperty)


module.exports = adminRoute