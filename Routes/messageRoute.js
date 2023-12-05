const express=require('express')
const messageRoute=express()
const{getMessage,addMessage}=require('../Controller/messageController')


messageRoute.get('/:chatId',getMessage)
messageRoute.post('/',addMessage)

module.exports=messageRoute