const express = require("express");
const { main } = require("./functions/ai");
const multer = require("multer");
const path = require("path");
const app = express();
const cors = require("cors");
const fs = require("fs");

const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

// Enable CORS
app.use(cors());

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Make sure this folder exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Twilio credentials
const accountSid = 'ACe56c93b7bb34682f0195e972dab66377';
const authToken = '8023687bdc4aa709b02aefe137d8a435';
// const twilioClient = twilio(accountSid, authToken);
const TWILIO_PHONE_NUMBER = '+19853321507'; // Your Twilio number
const TARGET_PHONE_NUMBER = '+919289471480'; // Your phone number

// Health check route
app.get("/", (req, res) => {
    res.json("Server working fine");
});

app.post("/upload", upload.single("image"), async (req, res) => {
    try {
        const filePath = req.file.path;
        const response = await main(filePath);

        fs.writeFile('a.txt', response, (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            } else {
                console.log('File has been written!');
            }
        });

        const call = await twilio.calls.create({
          twiml: `
              <Response>
                  <Say>Welcome to Aural Vision${response}</Say>
                  <Pause length='1'></Pause>
                  <Say>Thank You for coming to Aural Vision</Say>
              </Response>
          `,
          from: '+19853321507',
          to: '+919289471480'
      })

        console.log(`Call initiated: ${call.sid}`);
        res.status(200).json({ response, callSid: call.sid });
    } catch (error) {
        console.error("Error processing image or initiating call:", error);
        res.status(500).json({ error: "Failed to process image or initiate call." });
    }
});

// Get route to read file content
app.get("/get", async (req, res) => {
    fs.readFile('a.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            res.status(500).json({ error: "Failed to read file." });
        } else {
            console.log('File content:', data);
            res.status(200).json(data);
        }
    });
});

// Start the server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
