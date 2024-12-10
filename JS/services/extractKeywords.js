"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractKeywords = void 0;
const extractKeywords = (transcription) => {
    const keywords = ["soudure", "développeur", "Pau", "Paris"];
    const extractedKeywords = [];
    keywords.forEach((keyword) => {
        if (transcription.toLowerCase().includes(keyword.toLowerCase())) {
            extractedKeywords.push(keyword);
        }
    });
    console.log("Mots-clés extraits :", extractedKeywords);
    return extractedKeywords;
};
exports.extractKeywords = extractKeywords;
if (require.main === module) {
    const transcription = "Je suis un développeur à Paris avec des compétences en soudure.";
    (0, exports.extractKeywords)(transcription);
}
//# sourceMappingURL=extractKeywords.js.map