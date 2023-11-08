const  bcrypt =require( 'bcrypt')

const securePassword=async(password)=>{
    try{
       
        const gensalt=await bcrypt.genSalt()
        const hash=await bcrypt.hash(password,gensalt)
        return hash

    }catch(error){
        console.log(err.message)
    }
}
module.exports= securePassword;
