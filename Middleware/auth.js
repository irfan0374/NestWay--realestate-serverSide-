const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../model/userModel');
const Partner = require('../model/PartnerModel');
const userSecret = "USERIRFAN-IQBAL123"
const AdminSecret = "ADMINIRFAN-IQBAL123"
const ParterSecret = "PARTNERIRFAN-IQBAL123"

const userTokenVerify = async (req, res, next) => {
  try {

    let token = req.headers.authorization;
    if (!token) {
      return res.status(403).json({ message: 'Access Denied' });
    }
    if (token.startsWith('Bearer')) {
      token = token.slice(7, token.length).trimLeft();
    }
    const verified = jwt.verify(token, process.env.USER_SECRET);
    req.user = verified.id;
  
    if (verified.role == 'user') {

      const user = await User.findOne({ _id: verified.id });

      
  
    
      if (user.isBlocked) {
        return res.status(403).json({ message: 'User is Blocked' });
      } else {
        next();
      }
    } else { 
      return res.status(403).json({ message: 'Access denied' });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const adminTokenVerified = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {

      return res.status(403).json({ message: 'Access Denied' });
    }
    if (token.startsWith('Bearer')) {
      token = token.slice(7, token.length).trimLeft();
    }
    const verified = jwt.verify(token, process.env.ADMIN_SECRET);

    req.admin = verified;
    if (verified.role == 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access Denied' });
    }
  } catch (error) {
    console.log(error.message);
  }
}; 
const partnerTokenVerified = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      return res.status(403).json({ message: 'Access Denied' });
    }
    if (token.startsWith('Bearer')) {
      token = token.slice(7, token.length).trimLeft();
    }
    const verified = jwt.verify(token, process.env.PARTNER_SECRET);
    req.partner = verified;
    if (verified.role == 'partner') {
      const partner = await Partner.findOne({ email: verified.email });
      if (partner.isBlocked) {
        return res.status(403).json({ message: 'Partner is blocked' });
      } else {
        next();
      }
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  partnerTokenVerified,
  adminTokenVerified,
  userTokenVerify,
};

