const mongoose=require("mongoose")
const chatModel=mongoose.Schema(
    {
        members: {
          type: Array,
        },
      },
      { timestamps: true }
)
const Chat=mongoose.model("Chat",chatModel)
module.exports=Chat;