const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt");
require("dotenv").config()
const partner = require('../model/PartnerModel')
const otpGenerator = require("otp-generator")
const otpmodel = require('../model/otp')
let otp;

const securePassword = require('../utils/securepassword')
const sendGmail = require('../utils/nodemailer')

module.exports = {
    signup: async (req, res) => {
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

                res.status(200).json({ message: "Partner registered successfully " })
            } else {
                res.status(400).json({ message: "Incorrect otp " })
            }

        } catch (error) {
            console.log(error.message)
        }

    },
    loginVerification: async (req, res) => {
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
                        res.status(200).json({ Partner, token, message:`Welcome to ${partner.name}` })
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

}