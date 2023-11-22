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
const cloudinary = require('../utils/cloudinary')

const securePassword = require('../utils/securepassword')

const userRegistration = async (req, res) => {
    try {

        const { name, email, phone, password } = req.body
        const sPassword = await securePassword(password)
        const exsist = await user.findOne({ $or: [{ email: email }, { phone: phone }] })
        if (exsist) {
            res
                .status(401)
                .json({ status: "User already registered with this email" })

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
}

const otpVerify = async (req, res) => {
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
}
const loginVerification = async (req, res) => {
    try {

        const { email } = req.body
        const { password } = req.body

        const User = await user.findOne({ email: email })

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
                    res.status(200).json({ User, token, message: `Welcome ${user.name}` })

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
}
const UserGoolgleLogin = async (req, res) => {
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
        console.log(error.message)
        return res.status(500).json({ message: "internal server Error" })
    }
}
const propertyDetail = async (req, res) => {
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
}
const findUser = async (req, res) => {
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
}
const updateProfile = async (req, res) => {
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
}
const profileImage = async (req, res) => {
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
};
const rentProperty = async (req, res) => {
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
}
const saleProperty = async (req, res) => {
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
}


module.exports = {
    userRegistration,
    otpVerify,
    loginVerification,
    UserGoolgleLogin,
    propertyDetail,
    findUser,
    updateProfile,
    rentProperty,
    saleProperty,
    profileImage
}

