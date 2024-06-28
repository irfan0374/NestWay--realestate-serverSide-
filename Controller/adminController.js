const Partner = require('../model/PartnerModel')
const User = require('../model/userModel')
const Property = require('../model/propertyModel')
const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = {
    adminVerification: async (req, res) => {
        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD
        const userName = 'Admin'
        try {
            const { email, password } = req.body
         
            if (adminEmail == email) {
                
                if (adminPassword === password) {

                    const token = jwt.sign({
                        name: userName,
                        email: adminEmail,
                        role: "admin"
                    },
                        process.env.ADMIN_SECRET,
                        { expiresIn: "1hr" }
                    );
                    res.status(200).json({ userName, token, message: `welcome to ${userName}` })
                } else {
                    res.status(400).json({ message: "Password is incorrect" })
                }
            } else {
                res.status(400).json({ message: "Please check the email" })
            }
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ message: "Internal server Error" })
        }
    },
    userList: async (req, res) => {
        try {
            const users = await User.find().sort({ _id: -1 });
            res.status(200).json({ users })
        } catch (error) {
            console.log(error.message)
            res.status(200).json({ message: "Internal server Error" })
        }
    },

    partnerList: async (req, res) => {
        try {

            const partners = await Partner.find().sort({ _id: -1 });
            res.status(200).json({ partners });
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: "Internal server Error" });
        }
    },

    partnerBlock: async (req, res) => {
        try {
            const { partnerId, status } = req.body
            await Partner.findOneAndUpdate({ _id: partnerId }, { $set: { isBlocked: !status } })
            res.status(200).json({ message: "updated" })
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ message: "Internal server Error" })
        }
    },
    userBlock: async (req, res) => {
        try {

            const { userId, status } = req.body
            await User.findOneAndUpdate({ _id: userId }, { $set: { isBlocked: !status } })
            res.status(200).json({ message: "Updated" })
        } catch (error) {
            res.status(500).json({ message: "Inernal server Error" })
            console.log(error.message)
        }
    },
    findPartner: async (req, res) => {
        try {
            const { partnerId } = req.params;
        
            const partnerGet = await Partner.findOne({ _id: partnerId })
            if (partnerGet) {
                res.status(200).json({ partnerGet })
            } else {
                res.status(400).json({ message: "something went wrong in partnerData" })
            }

        } catch (error) {
            console.log(error.message)
            res.status(500).json({ message: "Internal server Error" })
        }
    },
    kycApproval: async (req, res) => {
        try {

            const { partnerId, status } = req.body
            if (status === "approve") {

                const partner = await Partner.findOneAndUpdate({ _id: partnerId }, { $set: { adminApproved: status } })
                res.status(200).json({ message: `${partner.name} kyc is approved` })
            } else {
                const partner = await Partner.findOneAndUpdate({ _id: partnerId }, { $set: { adminApproved: status } })
                res.status(200).json({ message: `${partner.name} kyc is rejected` })
            }

        } catch (error) {
            console.log(error.message)
            res.status(500).json({ message: "Internal server Error" })
        }
    },
    getProperty: async (req, res) => {
        try {

            const property = await Property.find().sort({ _id: -1 }).populate("partnerId")
            res.status(200).json({ property })
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ message: "Internal server Error" })
        } 
    },
    findProperty: async (req, res) => {
        try { 
    
            const { propertyId } = req.params
       
            const property = await Property.findOne({ _id: propertyId })
            if (property) {
                res.status(200).json({ property })
            } else {
                res.status(400).json({ message: "something went wrong" })
            }

        } catch (error) {
            console.log(error.message)
            res.status(500).json({ message: "Internal server Error" })
        }
    },
    approvalProperty:async(req,res)=>{
        try {
    
            const {propertyId,status}=req.body
            if(status==="approve"){
                const approve=await Property.findOneAndUpdate({_id:propertyId},{$set:{verificationStatus:status}})
             res.status(200).json({message:`${approve.propertyName} Property is Approved`})
            }else{
                const approve=await Property.findOneAndUpdate({_id:propertyId},{$set:{verificationStatus:status}})
                res.status(200).json({message:`${approve.propertyName} Property is Reject`})
            }
            
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ message: "Internal server Error" })
        }
    },
    premiumUSer:async(req,res)=>{
        try {
            const usersWithSubscription = await User.find({
                'subscription.planType': { $exists: true }
              });
            
              if(usersWithSubscription){
                res.status(200).json(usersWithSubscription)
              }            
        } catch (error) {
            res.status(200).json({message:"Internal Server Error"})
            console.log(error.message)
        }
    },
    adminDashboard:async(req,res)=>{
        try{
        
            let date = new Date();
            let year = date.getFullYear();
            let currentYear = new Date(year, 0, 1);
            let users = []
            let usersByYear = await User.aggregate([
              {
                $match: { createdAt: { $gte: currentYear }, isBlocked: { $ne: true } },
              },
              {
                $group: {
                  _id: { $dateToString: { format: "%m", date: "$createdAt" } },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ]);

            for (let i = 1; i <= 12; i++) {
              let result = true;
              for (let j = 0; j < usersByYear.length; j++) {
                result = false;
                if (usersByYear[j]._id == i) {
                  users.push(usersByYear[j]);
                  break;
                } else {
                  result = true;
                }
              }

              if (result) users.push({ _id: i, count: 0 });
            }
            let usersData = [];
            for (let i = 0; i < users.length; i++) { 
              usersData.push(users[i].count);    
            }
     
         
            let partners = []
            let partnersByYear = await Partner.aggregate([
              {
                $match: { createdAt: { $gte: currentYear }, isBlocked: { $ne: true } },
              },
              {
                $group: {
                  _id: { $dateToString: { format: "%m", date: "$createdAt" } },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ]);
            for (let i = 1; i <= 12; i++) {
              let result = true;
              for (let j = 0; j < partnersByYear.length; j++) {
                result = false;
                if (partnersByYear[j]._id == i) {
                  partners.push(partnersByYear[j]);
                  break;
                } else {
                  result = true;
                }
              }
              if (result) partners.push({ _id: i, count: 0 });
            }
            let partnersData = [];
            for (let i = 0; i < partners.length; i++) {
              partnersData.push(partners[i].count);
            }
        res.status(200).json({partnersData,usersData})

        }catch(error){
            res.status(500).json({message:"Internal server Error"})
            console.log(error.message)
        }
    } 

}
