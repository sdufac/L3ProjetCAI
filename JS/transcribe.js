"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const API_KEY = process.env.ASSEMBLYAI_API_KEY;
if (!API_KEY) {
    console.error("Erreur : Clé API AssemblyAI manquante. Ajoutez-la dans un fichier .env.");
    process.exit(1);
}
const UPLOAD_URL = "https://api.assemblyai.com/v2/upload";
const TRANSCRIBE_URL = "https://api.assemblyai.com/v2/transcript";
async function uploadAudio(filePath) {
    const fileStream = fs_1.default.createReadStream(filePath);
    const response = await axios_1.default.post(UPLOAD_URL, fileStream, {
        headers: {
            authorization: API_KEY,
            "content-type": "application/octet-stream",
        },
    });
    return response.data.upload_url;
}
async function transcribeAudio(audioUrl) {
    const response = await axios_1.default.post(TRANSCRIBE_URL, { audio_url: audioUrl }, {
        headers: {
            authorization: API_KEY,
        },
    });
    const transcriptId = response.data.id;
    console.log("Transcription en cours. ID :", transcriptId);
    let completed = false;
    while (!completed) {
        const statusResponse = await axios_1.default.get(`${TRANSCRIBE_URL}/${transcriptId}`, {
            headers: { authorization: API_KEY },
        });
        if (statusResponse.data.status === "completed") {
            console.log("Transcription terminée :", statusResponse.data.text);
            completed = true;
        }
        else if (statusResponse.data.status === "failed") {
            console.error("Erreur lors de la transcription :", statusResponse.data.error);
            completed = true;
        }
        else {
            console.log("En cours...");
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }
}
const audioFile = path_1.default.join(__dirname, "output-audio.mp3");
(async () => {
    try {
        console.log("Upload du fichier audio...");
        const audioUrl = await uploadAudio(audioFile);
        console.log("Fichier uploadé avec succès :", audioUrl);
        console.log("Lancement de la transcription...");
        await transcribeAudio(audioUrl);
    }
    catch (error) {
        console.error("Erreur lors du traitement :", error);
    }
})();
//# sourceMappingURL=transcribe.js.map