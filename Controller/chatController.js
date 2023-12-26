const Partner = require('../model/PartnerModel')
const Chat = require('../model/chatModel')
const User = require('../model/userModel')


module.exports={
    partnerData:async(req,res)=>{
        try{

         
            const {id}=req.params
            const result=await Partner.findOne({_id:id})
            if(result){

                res.status(200).json(result)
            }else{
                res.status(404).json({message:"something went wrong in fetch data"})
            }

        }catch(error){
            console.log(error.message)
            res.status(500).json({message:"Internal server Error"})
        }

    },
    userData:async(req,res)=>{
        try {
            const {id}=req.params
          
            const result=await User.findOne({_id:id})
            if(result){

                res.status(200).json(result)
            }else{
                res.status(404).json({message:"something went wrong in fetch data"})
            }
            
        } catch (error) {
            conosle.log(error.message)
        }
    },
 userChats :async (req, res) => {
        try {
          const { userId } = req.params;
      
          const chats = await Chat.aggregate([
            {
              $match: { members: userId },
            },
            {
              $lookup: {
                from: 'messages', // Replace with the actual name of your messages collection
                let: { chatIdToString: { $toString: '$_id' } }, // Convert _id to string
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$chatId", "$$chatIdToString"] }, // Match on the converted chatId
                    },
                  },
                  {
                    $sort: { createdAt: -1 }, // Sort messages in descending order based on timestamp
                  },
                  {
                    $limit: 1, // Get only the latest message
                  },
                ],
                as: 'messages',
              },
            },
            {
              $addFields: {
                lastMessageTimestamp: {
                  $ifNull: [{ $first: '$messages.createdAt' }, null],
                },
              },
            },
            {
              $sort: { lastMessageTimestamp: -1 }, // Sort chats based on the latest message timestamp
            },
          ]);
          res.status(200).json(chats);
        } catch (error) {
          console.log(error.message);
          return res.status(500).json({ message: "Internal Server Error" });
        }
      },

      createChat:async(req,res)=>{
        try {
          
            const{userId,partnerId}=req.body
            const chatExist = await Chat.findOne({
                members: {
                  $all: [
                    userId.toString(),
                    partnerId.toString(),
                  ],
                },
              });
              if (!chatExist) {
                const newChat = new Chat({
                  members: [
                    userId.toString(),
                    partnerId.toString(),
                  ],
                });
                await newChat.save();
              }else{
                const data="alreadyExist"
                res.status(200).json({data})
              }
            
        } catch (error) {
            console.log(error.message)
        }
      },
      userChat:async(req,res)=>{
        try {
            const { Id } = req.params;
            const chats = await Chat.aggregate([
              {
                $match: { members: Id },
              },
              {
                $lookup: {
                  from: 'messages', // Replace with the actual name of your messages collection
                  let: { chatIdToString: { $toString: '$_id' } }, // Convert _id to string
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$chatId", "$$chatIdToString"] }, // Match on the converted chatId
                      },
                    },
                    {
                      $sort: { createdAt: -1 }, // Sort messages in descending order based on timestamp
                    },
                    {
                      $limit: 1, // Get only the latest message
                    },
                  ],
                  as: 'messages',
                },
              },
              {
                $addFields: {
                  lastMessageTimestamp: {
                    $ifNull: [{ $first: '$messages.createdAt' }, null],
                  },
                },
              },
              {
                $sort: { lastMessageTimestamp: -1 }, // Sort chats based on the latest message timestamp
              },
            ]);
            res.status(200).json(chats);
        } catch (error) {
            console.log(error.message)
        }
      }
      

}

