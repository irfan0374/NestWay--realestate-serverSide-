const express = require('express')
const chatRouter=express();
const {partnerData,userData,createChat,userChat}=require('../Controller/chatController')


chatRouter.get('/getPartner/:id', partnerData)
chatRouter.get("/getUser/:id", userData)
chatRouter.post("/createChat", createChat)
chatRouter.get("/:Id", userChat)



module.exports = chatRouter; 