import express from "express";
import {File} from "./model/db.js"
import multer from "multer";
import dotenv from "dotenv";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs"; // To delete local files after upload

// Get current directory in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config(); // Load environment variables

const app = express();

// Set EJS as the template engine
app.set("view engine", "ejs");
app.use(express.static("public"));


// Cloudinary Configuration (Using .env for security)
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
});

// MongoDB Connection


// Route to render an upload form
app.get("/", (req, res) => {
    res.render("index", { url: null });
});

// Multer Storage (Saving Files Locally Before Uploading to Cloudinary)
const storage = multer.diskStorage({
    // destination: function (req, file, cb) {
    //     cb(null, path.join(__dirname, "public/uploads"));
    // },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix);
    }
});

const upload = multer({ storage });

// File Upload Route (Uploads to Cloudinary)
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });
        const file=req.file.path;
        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, { folder: "uploads" });

        // cludinary return soo many parameters but id is used to update the image
        // delete and secure url can be used to sahre in db 

        //res.json({ message: "File uploaded successfully!", url: result.secure_url });
        const db =await File.create({
            filename:file.originalname,
            public_id:result.public_id,
            imgUrl:result.secure_url,
        });
        res.render("index.ejs",{url:result.secure_url})
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        res.status(500).json({ error: "File upload failed" });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

