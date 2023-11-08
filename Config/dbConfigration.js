const mongoose=require('mongoose');
require('dotenv').config()

module.exports={
    dbConnect:()=>{
        mongoose.connect(process.env.MONGO_URL,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then(()=>{
            console.log("database connected")
        }).catch((err)=>{
            console.log(err)
        })
    },
};