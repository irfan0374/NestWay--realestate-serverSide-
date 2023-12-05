const mongoose=require("mongoose")
const messageModel=mongoose.Schema(
    {
        chatId: {
          type: String,
        },
        senderId: {
          type: String,
        },
        text: {
          type: String,
        },
      },
      { timestamps: true }
)
const Message=mongoose.model("Message",messageModel)
module.exports=Message;