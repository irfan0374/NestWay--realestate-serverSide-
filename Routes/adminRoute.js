const express=require('express')
const adminRoute=express()
const{adminVerification,userList,partnerList,partnerBlock,userBlock}=require('../Controller/adminController')

adminRoute.post('/adminLogin',adminVerification)
adminRoute.post('/listUser',userList)
adminRoute.post('/listPartner',partnerList)
adminRoute.post('/partnerBlock',partnerBlock)
adminRoute.post('/userBlock',userBlock)


module.exports=adminRoute