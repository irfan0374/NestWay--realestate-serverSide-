const Partner=require('../model/PartnerModel')
const User=require('../model/userModel')
const jwt=require('jsonwebtoken')
require('dotenv').config()

module.exports={
    adminVerification:async(req,res)=>{ 
        const adminEmail=process.env.ADMIN_EMAIL
        const adminPassword=process.env.ADMIN_PASSWORD
        const userName='Admin'
        try {
            const {email,password}=req.body
            console.log(email,password)
            if(adminEmail==email){
                
                if(adminPassword===password){

                    const token=jwt.sign({
                        name:userName,
                        email:adminEmail,
                        role:"admin"
                    },
                    process.env.USER_SECRET,
                    {expiresIn:"1hr"}
                    );
                    res.status(200).json({userName,token,message:`welcome to ${userName}`})
                }else{
                    res.status(400).json({message:"Password is incorrect"})
                }
            }else{
                res.status(400).json({message:"Please check the email"})
            }
        } catch (error) {
            console.log(error.message)
            res.status(500).json({message:"Internal server Error"})
        }
    },
    userList:async(req,res)=>{
        try {
            const users=await User.find()
            res.status(200).json({users})
        } catch (error) {
            console.log(error.message)
            res.status(200).json({message:"Internal server Error"})
        }
    },

    partnerList: async (req, res) => {
        try {
           
            const partners = await Partner.find();
            res.status(200).json({ partners });
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: "Internal server Error" });
        }
    },

    partnerBlock:async(req,res)=>{
        try {
            const {partnerId,status}=req.body
            await Partner.findOneAndUpdate({_id:partnerId},{$set:{isBlocked:!status}})
            res.status(200).json({message:"updated"})
        } catch (error) {
            console.log(error.message)
            res.status(500).json({message:"Internal server Error"})
        }
    },
    userBlock:async(req,res)=>{
        try{
            
            const {userId,status}=req.body
            await User.findOneAndUpdate({_id:userId},{$set:{isBlocked:!status}})
            res.status(200).json({message:"Updated"})
        }catch(error){
            res.status(500).json({message:"Inernal server Error"})
            console.log(error.message)
        }   
    }
}
