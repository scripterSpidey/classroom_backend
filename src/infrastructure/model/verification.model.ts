import mongoose from "mongoose";
import { Schema } from "mongoose";
import { I_VerificationDocument } from "../../interface/student_interface/I_student.verification";


const verificationSchema:Schema = new Schema<I_VerificationDocument>({
    userId:{ 
        type: mongoose.Schema.Types.ObjectId, 
        required:true, 
        ref:"Students", 
        index: true
    },
    role:{
        type:String,
        required:true,
        enum:['teacher','student']
    },
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    type:{
        type:String, 
        require:true
    },
    expiresAt:{
        type: Date, 
        required: true
    },
    otp:{
        type: String,
        reuired:true
    },
    createdAt:{
        type:Date,
        required:true
    }
})



export const VerificationModel = mongoose.model<I_VerificationDocument>("verifications",verificationSchema)
