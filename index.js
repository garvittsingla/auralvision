const express = require("express");
const { main } = require("./functions/ai");
const multer = require("multer");
const path = require("path");
const app = express();
const cors = require("cors")

app.use(cors())   
// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // make sure this folder exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Health check route
app.get("/", (req, res) => {
    res.json("Server working fine");
});

// Upload route
app.post("/upload", upload.single("image"), async (req, res) => {
    try {
        const filePath = req.file.path; // path to the uploaded image
        const response = await main(filePath); // pass path to main function

        console.log(response);
        res.json({ response });
    } catch (error) {
        console.error("Error processing image:", error);
        res.status(500).json({ error: "Failed to process image." });
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
