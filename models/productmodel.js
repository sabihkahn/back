import mongoose from 'mongoose';



const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
 
    description: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        require: true,

    },
   cutprice:{
    type:String
   },
    photo: {
        data: Buffer,
        contentType: String
    },
    link:{
        type:String
    },
    persent:{
        type:String
    }
},{timestamps:true}
)
export default mongoose.model('Productnew', productSchema);