require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");

const API_KEY = process.env.API_KEY;
console.log("API Key loaded:", API_KEY ? "Yes" : "No");
const genAI = new GoogleGenerativeAI(API_KEY);
const fileManager = new GoogleAIFileManager(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });

async function main(imagePath) {
    try {
        console.log("Starting AI processing for image:", imagePath);
        
        const uploadToGemini = async (path, mimeType) => {
            console.log("Uploading to Gemini:", path);
            const uploadResult = await fileManager.uploadFile(path, {
                mimeType,
                displayName: path,
            });
            const file = uploadResult.file;
            console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
            return file;
        };

        const generationConfig = {
            temperature: 1.3,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: "text/plain",
        };
        
        console.log("Starting file upload to Gemini");
        const files = [
            await uploadToGemini(`${imagePath}`, "image/png"),
        ];
        console.log("File uploaded successfully");

        console.log("Starting chat session");
        const chatSession = model.startChat({
            generationConfig,
            history: [
                {
                    role: "user",
                    parts: [
                        {
                            fileData: {
                                mimeType: files[0].mimeType,
                                fileUri: files[0].uri,
                            },
                        },
                        {
                            text: "You are a ai model , you are a eye of a blind person having camera from a spectacles, it can give you a random images and you have to explain it the content helping him to understand the context and explain the surroundings,wxplain whats the image is about, if there is a document in a picture just give the contnet of the document in the image here is the image uploaded in you , give me response in max 100 words everytime , make it a strict 100 words summarized ",
                        },
                    ],
                },
            ],
        });

        const user_prompt = "You are a ai model , you are a eye of a blind person having camera from a spectacles, it can give you a random images and you have to explain it the content helping him to understand the context and explain the surroundings,wxplain whats the image is about, if there is a document in a picture just give the contnet of the document in the image here is the image uploaded in you , give me response in max 100 words everytime , make it a strict 100 words summarized";
        
        console.log("Sending prompt to AI");
        const result = await chatSession.sendMessage(user_prompt);
        const aianswer = result.response.text();
        console.log("AI Response:", aianswer);
        return aianswer;
    } catch (error) {
        console.error("Error in AI processing:", error);
        throw error;
    }
}
module.exports = { main };