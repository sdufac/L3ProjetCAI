export const extractKeywords = (transcription: string): string[] => {
    const keywords = ["soudure", "développeur", "Pau", "Paris"];
    const extractedKeywords: string[] = [];
  
    keywords.forEach((keyword) => {
      if (transcription.toLowerCase().includes(keyword.toLowerCase())) {
        extractedKeywords.push(keyword);
      }
    });
  
    console.log("Mots-clés extraits :", extractedKeywords);
    return extractedKeywords;
  };
  
  if (require.main === module) {
    const transcription = "Je suis un développeur à Paris avec des compétences en soudure.";
    extractKeywords(transcription);
  }
  