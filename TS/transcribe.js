"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var fs = require("fs");
// Charger la clé API depuis les variables d'environnement ou définir directement ici
var API_KEY = process.env.API_KEY || "your-api-key";
var AUDIO_FILE_PATH = "./output-audio.mp3";
var transcribeAudio = function () { return __awaiter(void 0, void 0, void 0, function () {
    var audioData, uploadResponse, audioUrl, transcriptResponse, transcriptId, isComplete, transcriptResult, pollingResponse, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 10, , 11]);
                console.log("Téléchargement du fichier audio...");
                audioData = fs.createReadStream(AUDIO_FILE_PATH);
                return [4 /*yield*/, axios_1.default.post("https://api.assemblyai.com/v2/upload", audioData, {
                        headers: {
                            authorization: API_KEY,
                            "Content-Type": "application/octet-stream",
                        },
                    })];
            case 1:
                uploadResponse = _b.sent();
                audioUrl = uploadResponse.data.upload_url;
                console.log("Fichier uploadé avec succès :", audioUrl);
                console.log("Lancement de la transcription...");
                return [4 /*yield*/, axios_1.default.post("https://api.assemblyai.com/v2/transcript", {
                        audio_url: audioUrl,
                        language_code: "fr", // Langue française
                        punctuate: true, // Ajouter la ponctuation
                        format_text: true, // Reformater le texte
                        word_boost: ["maintenance", "industrielle", "emploi"], // Boost pour certains mots-clés
                        boost_param: "high", // Force du boost
                    }, {
                        headers: {
                            authorization: API_KEY,
                        },
                    })];
            case 2:
                transcriptResponse = _b.sent();
                transcriptId = transcriptResponse.data.id;
                console.log("Transcription en cours. ID :", transcriptId);
                isComplete = false;
                transcriptResult = void 0;
                _b.label = 3;
            case 3:
                if (!!isComplete) return [3 /*break*/, 9];
                return [4 /*yield*/, axios_1.default.get("https://api.assemblyai.com/v2/transcript/".concat(transcriptId), {
                        headers: { authorization: API_KEY },
                    })];
            case 4:
                pollingResponse = _b.sent();
                transcriptResult = pollingResponse.data;
                if (!(transcriptResult.status === "completed")) return [3 /*break*/, 5];
                isComplete = true;
                console.log("Transcription terminée :", transcriptResult.text);
                return [3 /*break*/, 8];
            case 5:
                if (!(transcriptResult.status === "failed")) return [3 /*break*/, 6];
                console.error("Échec de la transcription :", transcriptResult.error);
                return [2 /*return*/];
            case 6:
                console.log("En cours...");
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })];
            case 7:
                _b.sent(); // Pause de 5 secondes entre les vérifications
                _b.label = 8;
            case 8: return [3 /*break*/, 3];
            case 9: return [3 /*break*/, 11];
            case 10:
                error_1 = _b.sent();
                // Gérer les erreurs de manière sécurisée
                if (axios_1.default.isAxiosError(error_1)) {
                    console.error("Erreur lors du traitement :", ((_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data) || error_1.message);
                }
                else {
                    console.error("Erreur inconnue :", error_1);
                }
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
        }
    });
}); };
// Lancer la transcription
transcribeAudio();
