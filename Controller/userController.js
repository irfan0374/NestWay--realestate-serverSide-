const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
require('dotenv').config()
const otpGenerator = require('otp-generator')
let otpId;
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer");

const sendEmail = require("../utils/nodemailer")
const otpmodel = require('../model/otp')
const user = require('../model/userModel');
const property = require('../model/propertyModel')
const stripe = require('stripe')('sk_test_51OFr1pSB3NLla9eM1vE5JuNyD4fIMDGfyLEn6WZoaJNUzhZhKMzONjIuZWEQj8DZyprUuykNLJIRxWLXiadQgYqe00HEwuW6rM')
const cloudinary = require('../utils/cloudinary')
const partner = require('../model/PartnerModel')
const buyerDetails = require('../model/buyerContact')
const contactAgent = require('../utils/ContactAgent')
const securePassword = require('../utils/securepassword')

module.exports = {

    userRegistration: async (req, res) => {
        console.log("user loginnnn")

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
            const { email, password } = req.body

            const User = await user.findOne({ email: email })
            if (!User) {
                return res.status(401).json({ message: "User is not Registered" })
            }
            if (User?.isEmailVerified) {
                if (!User?.isBlocked) {
                    const correctPassword = await bcrypt.compare(password, User.password)
                    if (correctPassword) {
                        const token = jwt.sign({ name: User.name, email: User.email, id: User._id, role: "user" },

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
            const { prices } = req.body
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
    contactAgent: async (req, res) => {
        try {
            const { name, phone, email, description, partnerId } = req.body
            const Partner = await partner.findById({ _id: partnerId })

            const partnerEmail = Partner.email
            const partnerName = Partner.name
            const buyerData = new buyerDetails({
                partnerId: partnerId,
                buyerName: name,
                buyerEmail: email,
                buyerPhone: phone,
                description: description
            })
            const buyer = await buyerData.save()
            const sentMailtoAgent = await contactAgent(name, phone, email, partnerEmail, partnerName)
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" })
            console.log(error.message)
        }
    },
    findPartner: async (req, res) => {
        try {
            const { id } = req.params
            const Partner = await partner.findById({ _id: id })

            if (Partner) {
                res.status(200).json({ Partner })
            } else {
                res.status(401).json({ message: "something wrong fetch data" })
            }


        } catch (error) {
            res.status(500).json({ message: "Internal server error" })
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
    RentData: async (req, res) => {
        try {
            const { type } = req.params
            const Result = await property.find({
                verificationStatus: "approve",
                propertyFor: "rent",
                propertyType: type,
            }).populate("partnerId")

            if (Result) {
                res.status(200).json({ Result })
            } else {
                res.status(404).json({ message: "something went wrong" })
            }
        } catch (error) {
            res.status(500).json({ message: "Internal server Error" })

            console.log(error.message)
        }
    },

    SalesData: async (req, res) => {
        try {
            const { type } = req.params
            const Result = await property.find({
                verificationStatus: "approve",
                propertyFor: "sale",
                propertyType: type,
            }).populate("partnerId")

            if (Result) {
                res.status(200).json({ Result })
            } else {
                res.status(404).json({ message: "something went wrong" })
            }
        } catch (error) {
            res.status(500).json({ message: "Internal server Error" })

            console.log(error.message)
        }
    },
    RentForBudget: async (req, res) => {
        try {

            const { type } = req.params
            const Result = await property.find({
                verificationStatus: "approve",
                propertyFor: "rent",
                Price: {
                    $lte: type
                }
            }).populate("partnerId");

            if (Result) {
                res.status(200).json({ Result })
            } else {
                res.status(404).json({ message: "something went wrong" })
            }
        } catch (error) {
            console.log(error.message)
        }
    },
    SalesForBudget: async (req, res) => {
        try {
            console.log("ehllooo")

            const { type } = req.params
            const Result = await property.find({
                verificationStatus: "approve",
                propertyFor: "sales",
                Price: {
                    $lte: type
                }
            }).populate("partnerId");

            if (Result) {
                res.status(200).json({ Result })
            } else {
                res.status(404).json({ message: "something went wrong" })
            }
        } catch (error) {
            console.log(error.message)
        }
    },
    propertyByBhkRent: async (req, res) => {
        try {
            const { type } = req.params
            const Result = await property.find({
                verificationStatus: "approve",
                propertyFor: "rent",
                propertyBHK: type
            }).populate("partnerId");
            if (Result) {
                res.status(200).json({ Result })
            } else {
                res.status(404).json({ message: "something went wrong" })
            }
        } catch (error) {
            console.log(error.message)
        }
    },
    propertyByBhkSales: async (req, res) => {
        try {

            const { type } = req.params
            const Result = await property.find({
                verificationStatus: "approve",
                propertyFor: "sales",
                propertyBHK: type
            }).populate("partnerId");
            if (Result) {
                res.status(200).json({ Result })
            } else {
                res.status(404).json({ message: "something went wrong" })
            }
        } catch (error) {
            console.log(error.message)
        }
    },
    PasswordChange: async (req, res) => {
        try {
            const { oldPassword, newPassword, userId } = req.body

            const User = await user.findById({ _id: userId })
            const correctPassword = await bcrypt.compare(oldPassword, User.password)
            if (correctPassword) {
                const sPassword = await securePassword(newPassword)
                console.log(sPassword, "fdsaasdf")
                const changePassword = await user.findOneAndUpdate({ _id: userId }, { $set: { password: sPassword } })

                if (changePassword) {
                    console.log("hello change passord")
                    res.status(200).json({ message: "Password Updated" })
                } else {
                    res.status(400).json({ message: "something went wrong " })
                }
            } else {
                console.log("hellooooooo")
                res.status(400).json({ message: "Old password is incorrect" })
            }
        } catch (error) {
            res.status(500).json({ message: "Internal server Error" })
            console.log(error.message)
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const { email } = req.params
            const User = await user.findOne({ email: email })
            if (!User) {
                return res.status(404).json({ message: "User is not registered" })
            }
            const token = jwt.sign({ id: User._id }, process.env.USER_SECRET, { expiresIn: "5m" })

            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "nestway2266@gmail.com",
                    pass: "sizspjldgnpxzmpx"
                },
            });
            const mailOptions = {
                from: process.env.SMTP_MAIL,
                to: email,
                subject: "Forgot Password",
                text: `http://localhost:5173/resetPassword/${User._id}/${token}`
            }
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.error("Error sending email:", error);
                    return res
                        .status(500)
                        .json({ message: "Failed to send email for password reset." });
                } else {
                    console.log("Email sent:", info.response);
                    return res
                        .status(200)
                        .json({ message: "Email sent successfully for password reset." });
                }
            });


        } catch (error) {
            console.log(error.message)
        }
    },
    resetpassword: async (req, res) => {
        try {
            const { password } = req.body
            const { id, token } = req.params
            console.log(password, id, token, "hello reset backend")
            const User = await user.findById({ _id: id })
            if (!User) {
                return res.status(401).json({ message: "User is not found" })
            }
            try {
                const verify = jwt.verify(token, process.env.USER_SECRET)
                if (verify) {
                    const hashedPassword = await bcrypt.hash(password, 10)
                    await user.findByIdAndUpdate({ _id: id }, { $set: { password: hashedPassword } })
                    return res.status(200).json({ message: "Succesfully changed Password" })
                }

            } catch (error) {
                res.status(400).json({ message: "somthing wrong in token" })
                console.log(error.message)
            }

        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" })
            console.log(error.message)
        }
    },
    getThePropertyType: async (req, res) => {
        try {
            const propertyFor = await property.distinct("propertyFor")
            const propertyType = await property.distinct("propertyType")
            console.log(propertyFor, propertyType, "propertyTypeand propertyFor")
            if (propertyFor && propertyType) {
                res.status(200).json({ propertyFor, propertyType })
            } else {
                res.status(401).json({ message: "Something went wrong" })
            }
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" })
            console.log(error.message)
        }
    },
    searchFilter: async (req, res) => {
        try {
            const { propertytype, propertfor, pickuplocation } = req.body
            const Property = await property.find({ propertyType: propertytype, propertyFor: propertfor, location: pickuplocation })
           
            if (!Property) {
                return res.status(401).json({ message: " Your request has no matching properties" })
            } else {
                res.status(201).json({ Property })
            }

        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" })
            console.log(error.message)
        }
    },

}
