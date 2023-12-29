const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt");
require("dotenv").config()
const partner = require('../model/PartnerModel')
const otpGenerator = require("otp-generator")
const otpmodel = require('../model/otp')
let otp;
const property = require('../model/propertyModel')
const cloudinary = require('../utils/cloudinary')
const buyerContact = require('../model/buyerContact')
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

        try {

            const { email, password } = req.body
            const Partner = await partner.findOne({ email: email })


            if (!Partner) {

                return res.status(401).json({ message: "Email is incorrect Please check" })
            }
            if (Partner.isVerified) {


                if (!Partner.isBlocked) {

                    if (!Partner.adminApproved) {
                        res.status(401).json({ message: "KYC verification in progress.Please wait." })
                    } else if (Partner.adminApproved === "reject") {
                        res.status(401).json({ message: "your Kyc is not Approved" })
                    } else {



                        const comparePassword = await bcrypt.compare(password, Partner.password)
                        if (comparePassword) {

                            const token = jwt.sign({ name: Partner.name, email: Partner.email, partnerId: Partner._id, role: "partner" },
                                process.env.PARTNER_SECRET,
                                {
                                    expiresIn: "1hr"
                                }
                            )

                            res.status(200).json({ Partner, token, message: `Welcome to ${partner.name}` })
                        } else {
                            res.status(401).json({ message: "Password is incorrect" })
                        }
                    }

                } else {

                    res.status(401).json({ message: "Parnter is blocked by Admin" })
                }
            } else {

                res.status(401).json({ message: "Email is not verified" })
            }


        } catch (error) {
            console.log(error.message)
            res.status(500).json({ message: "internal server error" })
        }
    },
    partnerKycUpload: async (req, res) => {
        try {
            const { partnerId, kycImage } = req.body
            const kycUpload = await cloudinary.uploader.upload(kycImage, { folder: "kycImage" })

            const partners = await partner.findOneAndUpdate({ _id: partnerId }, { $set: { kycimage: kycUpload.secure_url } })
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
        console.log(req.body, 'body');
        try {
            const { type, propertyname, state, city, price, floor, bathroom, description, propertyImage, bhk, propertyFor, partnerId, location, featureField, numberOfPeople } = req.body
    
         

            const uploadedPromises = propertyImage.map((image) => {
                return cloudinary.uploader.upload(image, { folder: "propertyImage" })
                    .catch(error => {
                        // Handle individual upload errors
                        console.error(`Error uploading image: ${error.message}`);
                        return null; // Signal failure for this image
                    });
            });
     
            // Await for all uploads to complete
            const uploadedImage = await Promise.all(uploadedPromises); 
    
            // Check if any of the uploads failed
            if (uploadedImage.some(image => image === null)) {
                return res.status(400).json({ message: "One or more images failed to upload" });
            }
    
            // Extract the URLs from the successful uploads
            const PropertyImage = uploadedImage.map((image) => image.secure_url);
    
            const Property = await property.create({
                partnerId,
                propertyFor: propertyFor,
                propertyName: propertyname,
                propertyType: type,
                state,
                city,
                floor,
                features: featureField,
                propertyBHK: bhk,
                bathroom,
                personCanStay: numberOfPeople,
                description,
                location,
                Price: price,
                propertyImage: PropertyImage,
            });
    
            res.status(200).json({ Property, message: "Property added successfully" })
    
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    
    listProperty: async (req, res) => {
        try {
            const { partnerId } = req.params;
            const Property = await property.find({ partnerId: partnerId })
            if (Property) {
                res.status(200).json({ Property })
            } else {
                res.status(400).json({ message: "something happended to find the property details" })
            }
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ message: "internal server Error" })
        }
    },

    detailProperty: async (req, res) => {
        try {

            const { propertyId } = req.params;
            const detailProperty = await property.findOne({ _id: propertyId })

            if (detailProperty) {
                res.status(200).json({ detailProperty })
            } else {
                res.status(400).json({ message: "something went wrong Property not found" })
            }
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ message: "internal server error" })
        }
    },
    findParnter: async (req, res) => {
        try {

            const email = req.partner.email

            const Partner = await partner.findOne({ email: email })
            if (Partner) {
                res.status(200).json({ Partner })
            } else {
                res.status(401).json({ message: "something went wrong" })
            }

        } catch (error) {
            res.status(500).json({ message: "Internal server error" })


            console.log(error.message)
        }
    },
    partnerProfile: async (req, res) => {
        try {
            const { name, phone, partnerId } = req.body
            const Partner = await partner.findOneAndUpdate({ _id: partnerId }, { $set: { name: name, phone: phone } })
            if (Partner) {
                res.status(200).json({ Partner })
            } else {
                res.status(401).json({ message: "something went wrong" })
            }
        } catch (error) {
            console.log(error.message)
        }
    },
    partnerimage: async (req, res) => {
        try {
            const { imageData, partnerId } = req.body
            const profile = await cloudinary.uploader.upload(imageData, { folder: "partnerProfile" })
            const Partner = await partner.findOneAndUpdate({ _id: partnerId }, { $set: { profile: profile.secure_url } })
            if (Partner) {
                res.status(200).json({ Partner })
            } else {
                res.status(401).json({ message: "something went wrong" })
            }
        } catch (error) {
            res.status(500).json({ message: "Internal server error" })

            console.log(error.message)
        }
    },
    addDescription: async (req, res) => {
        try {
         
            const { state, location, description, partnerId } = req.body

            const partnerData = await partner.findOneAndUpdate({ _id: partnerId }, { $set: { "aboutMe.state": state, "aboutMe.location": location, "aboutMe.description": description } })
            if (partnerData) {
                res.status(200).json({ message: "Description added" })
            } else {
                res.status(401).json({ message: "something went wrong" })
            }
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ message: "Internal server error" })
        }
    },
    findProperty: async (req, res) => {
        try {
            const { id } = req.params
            const Property = await property.findById({ _id: id })
            if (Property) {
                res.status(200).json({ Property })
            } else {
                res.status(401).json({ message: "Internal server error" })
            }

        } catch (error) {
            res.status(500).json({ message: "Internal server error" })
            console.log(error.message)
        }
    },
    updateProperty: async (req, res) => {
        try {
            const { id } = req.params;
            const { type, propertyname, state, city, price, floor, bathroom, description, propertyImage, bhk, propertyFor, location, featureData, numberOfPeople } = req.body;

            let existingImage = [];
            let existingProperty = await property.findById({ _id: id });

            if (propertyImage.length === 0) {
                existingImage = existingProperty.propertyImage;
            } else {
                const uploaderPromise = propertyImage.map((image) => {
                    return cloudinary.uploader.upload(image, { folder: "propertyImage" });
                });


                const uploadImage = await Promise.all(uploaderPromise);
              

                if (existingProperty && existingProperty.propertyImage && existingProperty.propertyImage.length > 0) {
                    existingImage = existingProperty.propertyImage;
                }
 
                let propertyImg = uploadImage.map((data) => data.secure_url);

                for (let i = 0; i < propertyImg.length; i++) {
                    existingImage.push(propertyImg[i]);
                }
            }

            const Property = await property.findOneAndUpdate(
                { _id: id },
                {
                    $set: {
                        propertyFor: propertyFor,
                        propertyName: propertyname,
                        propertyType: type,
                        state,
                        city,
                        floor,
                        features: featureData,
                        propertyBHK: bhk,
                        bathroom,
                        description,
                        location,
                        Price: price,
                        propertyImage: existingImage,
                        personCanStay: numberOfPeople,
                    },
                }
            );

            if (Property) {
                res.status(200).json({ Property });
            } else {
                res.status(401).json({ message: "something went wrong" });
            }
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    deletepropertyImage: async (req, res) => {
        try {
        

            const { imgsrc } = req.body
          
            const { id } = req.params

            const matchResult = await imgsrc.match(/\/v\d+\/(.+?)\./);
            const publicId = matchResult[1]; 

            const deletionResult = await cloudinary.uploader.destroy(publicId, { folder: "propertyImage" })

            if (deletionResult.result === 'ok') {
                const updateData = await property.findByIdAndUpdate({ _id: id }, { $pull: { propertyImage: imgsrc } }, { new: true })
                if (!updateData) {
                    return res.status(404).json({ message: "Property not found" })
                }
                res.status(200).json({ updateData, message: "Image remove successfully" })
            } else {
                console.error(`failed to remove the Image${imgsrc}from cloudinary`)
            }
 
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ message: "Internal server error" })
        }
    },
    fetchBuyer: async (req, res) => {
        try {
            const { partnerId } = req.params
            const buyer = await buyerContact.find({ partnerId: partnerId })
            if (buyer) {
                res.status(200).json({ buyer })
            } else {
                res.status(404).json({ message: "something went wrong in fetch data" })
            }

        } catch (error) {
            res.status(500).json({ message: "Internal server Error" })
            console.log(error.message)
        }
    },
    hideTheProperty:async(req,res)=>{
        try{
         const{isChecked,propertyId}=req.body
       
         const Property=await property.findOneAndUpdate({_id:propertyId},{propertyStatus:!isChecked})
         if(Property){
            if(Property.propertyStatus==true){

                res.status(201).json({message:"Property Display",Data:Property.propertyStatus})
            }else{
                res.status(201).json({message:"Property Hide",Data:Property.propertyStatus})
            }
         }else{
            res.status(401).json({message:"something went wrong"})
         } 
          
        }catch(error){
            res.status(500).json({message:"Internal server Error"})
            console.log(error.message)
        }
    },
    resendOpt:async(req,res)=>{
        try{
            const {partnerId}=req.body
            const data=partner.findOne({_id:partnerId})
            const otpId=await sendGmail(data.name,data.email,data._id)
            if(otpId){
                res.status(200).json({message:`Resent otp sent to ${data.email}`})
            }

        }catch(error){
            res.status(500).json({message:"Internal Server Error"})
            console.log(error.message)
        }
    }
}     