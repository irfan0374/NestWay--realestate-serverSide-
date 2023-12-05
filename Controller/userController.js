const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
require('dotenv').config()
const otpGenerator = require('otp-generator')
let otpId;
const bcrypt = require("bcrypt")

const sendEmail = require("../utils/nodemailer")
const otpmodel = require('../model/otp')
const user = require('../model/userModel');
const property = require('../model/propertyModel')
const stripe = require('stripe')('sk_test_51OFr1pSB3NLla9eM1vE5JuNyD4fIMDGfyLEn6WZoaJNUzhZhKMzONjIuZWEQj8DZyprUuykNLJIRxWLXiadQgYqe00HEwuW6rM')
const cloudinary = require('../utils/cloudinary')
const partner=require('../model/PartnerModel')
const buyerDetails=require('../model/buyerContact')
const contactAgent=require('../utils/ContactAgent')


const securePassword = require('../utils/securepassword')
module.exports = {

    userRegistration: async (req, res) => {
        try {


            const { name, email, phone, password } = req.body

            const sPassword = await securePassword(password)
            const exsist = await user.findOne({ $or: [{ email: email }, { phone: phone }] })
            if (exsist) {
                res.status(401).json({ status: "User already registered with this email" })

            } else {
                const User = new user({
                    name: name,
                    email: email,
                    phone: phone,
                    password: sPassword,
                })
                const userData = await User.save()

                otpId = await sendEmail(userData.name, userData.email, userData._id)
                res.status(201)
                    .json({
                        status: `otp has been sent to ${email}`,
                        userData: userData,
                        otpId: otpId
                    })


            }

        } catch (error) {
            console.log(error.message)
            res.status(500).json({ status: "internal server Error" })
        }
    },

    otpVerify: async (req, res) => {
        try {
            const { otp, userId } = req.body
            const findOtp = await otpmodel.find({ userId: userId })
            const { expiresAt } = findOtp[findOtp.length - 1] 
            const correctOtp = findOtp[findOtp.length - 1].otp

            if (correctOtp && expiresAt < Date.now()) {
                return res.status(401).json({ message: "Email Otp is expired" })
            }
            if (correctOtp === otp) {
                await otpmodel.deleteMany({ userId: userId });
                await user.updateOne({ _id: userId }, { $set: { isEmailVerified: true } });

                res.status(200).json({ status: true, message: "User Registered succesfully You can login now" })
            } else {
                res.status(409).json({ status: true, message: "Incorrect Otp" })
            }

        } catch (err) {
            console.log(err.message)
        }
    },
    loginVerification: async (req, res) => {
        try {
            const { email } = req.body
            const { password } = req.body

            const User = await user.findOne({ email: email })
            console.log(User)

            if (!User) {
                return res.status(401).json({ message: "User is not Registered" })
            }
            if (User.isEmailVerified) {
                if (!User?.isBlocked) {
                    const correctPassword = await bcrypt.compare(password, User.password)
                    if (correctPassword) {
                        const token = jwt.sign({ name: User.name, email: User.email, userId: User._id, role: "user" },
                            process.env.USER_SECRET,
                            {
                                expiresIn: "1hr"
                            }
                        );
                        res.status(200).json({ User, token, message: `Welcome ${User.name}` })

                    } else {

                        res.status(400).json({ message: "Password is incorrect" })
                    }
                } else {
                    res.status(400).json({ message: "User is Blocked by admin" })
                }
            } else {
                res.status(400).json({ message: "Email is not verified" })
            }



        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: "Internal Server Error" })
        }
    },
    UserGoolgleLogin: async (req, res) => {
        try {
            const { userEmail } = req.body

            const registeredUser = await user.findOne({ email: userEmail })
            console.log(registeredUser)

            if (!registeredUser) {
                res.status(400).json({ message: "user is not exists" })
            } else {

                const token = jwt.sign({
                    id: registeredUser._id,
                    role: "user"
                },  

                    process.env.USER_SECRET,
                    {
                        expiresIn: "1hrs"
                    }
                );


                res.status(200).json({ token, registeredUser, message: `Welcome ${registeredUser.name}` });
            }

        } catch (error) {
            return res.status(500).json({ message: "internal server Error" })
        }
    },
    propertyDetail: async (req, res) => {
        try {

            const { propertyId } = req.params;
            console.log(propertyId)
            const Property = await property.findOne({ _id: propertyId })
            if (Property) {
                res.status(200).json({ Property })
            } else {
                res.status(400).json({ message: "something went wrong!!" })
            }
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ message: "Internal Server Error" })
        }
    },
    findUser: async (req, res) => {
        try {


            const { id } = req.params;
            console.log(id)

            const User = await user.findOne({ _id: id })
            if (User) {
                res.status(200).json({ User })
            } else {
                res.status(401).jsons({ message: "something went wrong" })
            }
        } catch (error) { 
            console.log(error.message)
            res.status(500).json({ message: "Internal Server Error" })
        }
    },
    updateProfile: async (req, res) => {
        try {
            const { name, phone, userId } = req.body
            const User = await user.findOneAndUpdate(
                { _id: userId },
                { $set: { name: name, phone: phone } },
                { new: true }
            );
            if (User) {
                res.status(200).json({ User })
            } else {
                res.status(401).json({ message: "Something went wrong" })
            }
        } catch (error) {
            res.status(500).json({ message: "Internal server Error" })
            console.log(error.message)
        }
    },
    profileImage: async (req, res) => {
        try {


            const { image, id } = req.body;

            // Upload image to Cloudinary
            const profileImageResponse = await cloudinary.uploader.upload(image, { folder: "profilePic" });
            const User = await user.findOneAndUpdate(
                { _id: id },
                { $set: { profile: profileImageResponse.secure_url } }, { new: true }
            );
            if (User) {
                res.status(200).json({ User })
            } else {
                res.status(401).json({ message: "Something went wrong" })
            }
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ error: error.message });
        }
    },
    rentProperty: async (req, res) => {
        try {
            const rentProperty = await property.find({ propertyFor: "rent", verificationStatus: "approve" }).populate("partnerId")

            if (rentProperty) {
                res.status(200).json({ rentProperty })
            }
            else {
                res.status(401).json({ message: "Something went wrong" })
            }
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ message: "Internal Server Error" })
        }
    }, 
    saleProperty: async (req, res) => {
        try {

            const saleProperty = await property.find({ propertyFor: "sale", verificationStatus: "approve" }).populate("partnerId")
            if (saleProperty) {
                res.status(200).json({ saleProperty })
            } else {
                res.status(401).json({ message: "something Went Wrong" })
            }

        } catch (error) {
            console.log(error.message)
        }
    },
    subscription: async (req, res) => {
        try {


            const stripe = require('stripe')('sk_test_51OFr1pSB3NLla9eM1vE5JuNyD4fIMDGfyLEn6WZoaJNUzhZhKMzONjIuZWEQj8DZyprUuykNLJIRxWLXiadQgYqe00HEwuW6rM');
            const { prices, User } = req.body
            const subscriptionType = prices.interval


            const session = await stripe.checkout.sessions.create({
                mode: 'subscription',
                line_items: [
                    {
                        price: prices.id,
                        quantity: 1,
                    },
                ],
                success_url: `http://localhost:5173/status?success=true&Type=${subscriptionType}`,
                cancel_url: `http://localhost:5173/status`,
            });

            res.status(200).json({ session })
        } catch (error) {
            console.log(error);
        }
    },

    premiumUpdate: async (req, res) => {
        try {

            const { id } = req.params
            const { typeOfSub } = req.body
            const updatePremium = await user.findOneAndUpdate({ _id: id }, { $set: { "subscription.planType": typeOfSub } })
            
            if (updatePremium) {
                res.status(200).json({ message: "Updated to premium account" }) 
            } else {
                res.status(200).json({ message: "something went wrong" })
            }

        } catch (error) {
            res.status(500).json({ message: "Internal server Error" }) 
            console.log(error.message)
        }
    },
    contactAgent:async(req,res)=>{
        try { 
            const {name,phone,email,description,partnerId}=req.body
            const Partner=await partner.findById({_id:partnerId})
          
            const partnerEmail=Partner.email
            const partnerName=Partner.name
            const buyerData = new buyerDetails({
                partnerId: partnerId,
                buyerName:name,
                buyerEmail: email,
                buyerPhone: phone,
                description:description
            })
            const buyer = await buyerData.save()
            const sentMailtoAgent=await contactAgent(name,phone,email,partnerEmail,partnerName) 
        } catch (error) {
            res.status(500).json({message:"Internal Server Error"})
            console.log(error.message)
        }
    },
    findPartner:async(req,res)=>{
        try {
            const {id}=req.params
            const Partner=await partner.findById({_id:id})

            if(Partner){
                res.status(200).json({Partner}) 
            }else{
                res.status(401).json({message:"something wrong fetch data"})
            }

            
        } catch (error) {
            res.status(500).json({message:"Internal server error"}) 
            console.log(error.message)
        }
    },
    allUser: async (req, res) => {
        try {
            const keyword = req.query.search
                ? {
                    $or: [
                        { name: { $regex: req.query.search, $options: "i" } },
                        { email: { $regex: req.query.search, $options: "i" } },
                    ],
                  }
                : {};
    
    
            const users = await user.find({ ...keyword, _id: { $ne: req.user.userId } });
            console.log(users, "users");
    
            if (users) {
                res.status(200).json({ users });
            } else {
                res.status(400).json({ message: "Something went wrong fetching the data" });
            }
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    
}
