
import { GoogleGenAI } from "@google/genai";

const key = "AIzaSyCe3UpMORt3JMa4Vng5t0PJ1-qUNXciOno"; // Temporarily hardcoded for testing

const client = new GoogleGenAI({ apiKey: key });

async function listModels() {
    try {
        const models = await client.models.list();
        console.log("Available models:");
        models.forEach(m => console.log(`- ${m.name}`));
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
