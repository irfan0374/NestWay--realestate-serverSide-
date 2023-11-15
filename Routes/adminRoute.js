const express = require('express')
const adminRoute = express()
const { adminVerification, userList, partnerList, partnerBlock, userBlock, findPartner, kycApproval, getProperty, findProperty, approvalProperty } = require('../Controller/adminController')

adminRoute.post('/adminLogin', adminVerification)
adminRoute.post('/listUser', userList)
adminRoute.post('/listPartner', partnerList)
adminRoute.post('/partnerBlock', partnerBlock)
adminRoute.post('/userBlock', userBlock)
adminRoute.get('/getPartner/:partnerId', findPartner)
adminRoute.patch('/kycApproval', kycApproval)
adminRoute.get('/getProperty', getProperty)
adminRoute.get('/findProperty/:propertyId', findProperty)
adminRoute.patch('/propertyApproval', approvalProperty)


module.exports = adminRoute