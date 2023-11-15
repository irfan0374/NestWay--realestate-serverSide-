const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt");
require("dotenv").config()
const partner = require('../model/PartnerModel')
const otpGenerator = require("otp-generator")
const otpmodel = require('../model/otp')
let otp;
const property=require('../model/propertyModel')
const cloudinary =require('../utils/cloudinary')

const securePassword = require('../utils/securepassword')
const sendGmail = require('../utils/nodemailer')

module.exports = {
    signup: async (req, res) => {
        console.log("signup")
        try {
            const { name, email, phone, password } = req.body
            const sPassword = await securePassword(password)
            const exist = await partner.findOne({ email: email }, { phone: phone })
            if (exist) {
                res.status(400).json({ message: "email is already exist" })
            } else {
                const Partner = new partner({
                    name: name,
                    email: email,
                    phone: phone,
                    password: sPassword,
                })
                const partnerData = await Partner.save()

                otp = await sendGmail(partnerData.name, partnerData.email, partnerData._id)
                res.status(200).json({
                    status: `otp has been sent to ${email}`,
                    partnerData: partnerData,
                    otpId: otp
                })
            }

        } catch (error) {
            console.log(error.message)
            res.status(500).json({ message: "internal server Error" })
        }
    },
    otpVerification: async (req, res) => {
        try {

            const { otp, partnerId } = req.body

            const findOtp = await otpmodel.find({ userId: partnerId })
            const { expiresAt } = findOtp[findOtp.length - 1]
            const correctOtp = findOtp[findOtp.length - 1].otp
            if (correctOtp && expiresAt < Date.now()) {
                res.status(400).json({ message: "Otp is exipied" })
            }
            if (correctOtp === otp) {
                console.log("otp is correct")
                await otpmodel.deleteMany({ userId: partnerId })
                await partner.updateOne({ _id: partnerId }, { $set: { isVerified: true } })

                res.status(200).json({ message: "please Complete the verification " })
            } else {
                res.status(400).json({ message: "Incorrect otp " })
            }

        } catch (error) {
            console.log(error.message)
        }

    },
    loginVerification: async (req, res) => {
        console.log("login")

        try {

            const { email, password } = req.body
            const Partner = await partner.findOne({ email: email })

            if (!Partner) {

                res.status(400).json({ message: "Email is incorrect Please check" })
            }
          

           
            if (Partner.isVerified) {

                if (!Partner.isBlocked) {

                    const comparePassword = await bcrypt.compare(password, Partner.password)
                    if (comparePassword) {

                        const token = jwt.sign({ name: Partner.name, email: Partner.email, partnerId: Partner._id, role: "partner" },
                            process.env.USER_SECRET,
                            {
                                expiresIn: "1hr"
                            }
                        )
                        res.status(200).json({ Partner, token, message: `Welcome to ${partner.name}` })
                    } else {
                        res.status(400).json({ message: "Password is incorrect" })
                    }
                } else {

                    res.status(400).json({ message: "Parnter is blocked by Admin" })
                }
            } else {
                res.status(400).json({ message: "Email is not verified" })
            }

        } catch (error) {
            console.log(error.message)
            res.status(500).json({ message: "internal server error" })
        }
    },
    partnerKycUpload: async (req, res) => {
        try {
            const { partnerId, kycImage } = req.body
            console.log("jeel")
            const partners = await partner.findOneAndUpdate({ _id: partnerId }, { $set: { kycimage: kycImage } })
            if (partners) {
                res.status(200).json({ message: "Kyc uploaded" })
            }
            else {
                res.status(400).json({ message: "something went wrong" })
            }
        } catch (error) {
            console.log(error.message)
        }
    },
    addProperty: async (req, res) => {
        
        try {
            const { type, propertyname, state, city, price, floor, bathroom, description, propertyImage, bhk, propertyFor, partnerId,location } = req.body
                
            const uploadedPromises=propertyImage.map((image)=>{
               return cloudinary.uploader.upload(image,{folder:"propertyImage"})
            })

            // Await for all upload to complete the all uploads

            const uploadedImage=await Promise.all(uploadedPromises) 
            // store the url in the Property image arr
            const PropertyImage=uploadedImage.map((image)=>image.secure_url);
           const Property= await property.create({
                partnerId,
                propertyFor:propertyFor,
                propertyName:propertyname,
                propertyType:type,
                state,
                city,
                floor,
                propertyBHK:bhk,
                bathroom,
                description,
                location,
                Price:price,
                propertyImage,
            });
            
            res.status(200).json({Property ,message:"Property added successfully"})

        } catch (error) {
            console.log(error.message)
            res.status(500).json({message:"internal server error"})
        }
    },
    listProperty:async(req,res)=>{
        try{
            const {partnerId}=req.params;
            const Property=await property.find({partnerId:partnerId})
            if(Property){
                res.status(200).json({Property})
            }else{
                res.status(400).json({message:"something happended to find the property details"})
            }            
        }catch(error){
            console.log(error.message)
            res.status(500).json({message:"internal server Error"})
        }
    },  

    detailProperty:async(req,res)=>{
        try{ 

        const{propertyId}=req.params;
        const detailProperty=await property.findOne({_id:propertyId})
       
        if(detailProperty){
            res.status(200).json({detailProperty})
        }else{
            res.status(400).json({message:"something went wrong Property not found"})
        }
    }catch(error){
        console.log(error.message)
        res.status(500).json({message:"internal server error"})
    }
},
}