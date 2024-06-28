const Message=require('../model/message')

module.exports={

    getMessage:async(req,res)=>{
        try {
            const {chatId}=req.params
            const result=await Message.find({chatId})
         
            if(result){
                res.status(200).json(result)
            } 
        } catch (error) {
            res.status(500).json({message:'Internal server Error'})  
            console.log(error.message)
        }
    },
        addMessage:async(req,res)=>{
            try {
                const {chatId,text,senderId} = req.body 


              
                const message=new Message({chatId,text,senderId})
                const result=await message.save()
 
                 res.status(200).json(result)

            
            } catch (error) {
                console.log(error.message)
                return res.status(500).json({message:"Internal server Error"})
            }
        },
}