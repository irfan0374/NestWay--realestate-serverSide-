const mongoose=require('mongoose')
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    profile:{
        type:String,
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    },
    subscription:{
        planStartDate :{
            type: Date
        },
        planEndDate: {
            type: Date 
        },
        planType:{
            type:String
        }
    },

    isBlocked:{
        type:Boolean,
        default:false
    }
   
})
const user=mongoose.model("User",userSchema)
module.exports=user

