const express =require('express')
const app =express()
require('dotenv').config()
const cors=require("cors")
const PORT=3001

const dbConnect=require('./Config/dbConfigration')
dbConnect.dbConnect()

app.use(express.json({limit:"50mb"}))
app.use(express.urlencoded({limit:"50mb",extended:true}));

app.use(cors({
    origin:"http://localhost:5173",
    methods:['GET','POST',"PATCH"],
    credentials: true ,
    optionsSuccessStatus:200
}))

const userRoutes=require('./Routes/userRoute.js')
app.use('/',userRoutes)

const adminRoutes=require('./Routes/adminRoute')
app.use('/admin',adminRoutes)

const partnerRoutes=require('./Routes/partnerRoute')
app.use('/partner',partnerRoutes)

  
app.listen(PORT,()=>{
    console.log(`server running port http://localhost:${PORT}`);
})

