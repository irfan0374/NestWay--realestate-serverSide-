const mongoose=require("mongoose")
const buyerContact=new mongoose.Schema({
    partnerId:{
        type:mongoose.Types.ObjectId,
        ref:"partner",
        required:true
    },
    buyerName:{
        type:String,
        required:true
    },
    buyerEmail:{
        type:String,
        required:true
    },
    buyerPhone:{
        type:Number,
        required:true,
    },
    description:{
        type:String,
    }

});
const buyerDetails=mongoose.model("buyerContact",buyerContact)
module.exports=buyerDetails