import mongoose, { mongo } from "mongoose";
mongoose.connect("mongodb://127.0.0.1:27017/ImageUploader")
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.log("❌ MongoDB Error:", err.message));

const ImageSchema= new mongoose.Schema({
    filename:String,
    public_id:String,
    imgUrl:String,
});

const File=mongoose.model("cloudinary",ImageSchema);

export {File};