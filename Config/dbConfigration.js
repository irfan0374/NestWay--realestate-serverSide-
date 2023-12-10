const mongoose=require('mongoose');
require('dotenv').config()

module.exports={
    dbConnect:()=>{
        mongoose.connect("mongodb+srv://irfan188iqbal:irfan10@cluster0.yh8xsjx.mongodb.net/SevenSky",{
            useNewUrlParser: true, 
            useUnifiedTopology: true,
        }).then(()=>{
            console.log("database connected")
        }).catch((err)=>{
            console.log(err)
        })
    },
};

