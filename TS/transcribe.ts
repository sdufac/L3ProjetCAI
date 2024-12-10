import axios from "axios";
import * as fs from "fs";

// Charger la clé API depuis les variables d'environnement ou définir directement ici
const API_KEY = process.env.API_KEY || "your-api-key";
const AUDIO_FILE_PATH = "./output-audio.mp3";

const transcribeAudio = async () => {
  try {
    console.log("Téléchargement du fichier audio...");

    // Charger le fichier audio et le télécharger vers AssemblyAI
    const audioData = fs.createReadStream(AUDIO_FILE_PATH);
    const uploadResponse = await axios.post("https://api.assemblyai.com/v2/upload", audioData, {
      headers: {
        authorization: API_KEY,
        "Content-Type": "application/octet-stream",
      },
    });

    const audioUrl = uploadResponse.data.upload_url;
    console.log("Fichier uploadé avec succès :", audioUrl);

    console.log("Lancement de la transcription...");

    // Démarrer la transcription
    const transcriptResponse = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      {
        audio_url: audioUrl,
        language_code: "fr", // Langue française
        punctuate: true, // Ajouter la ponctuation
        format_text: true, // Reformater le texte
        word_boost: ["maintenance", "industrielle", "emploi"], // Boost pour certains mots-clés
        boost_param: "high", // Force du boost
      },
      {
        headers: {
          authorization: API_KEY,
        },
      }
    );

    const transcriptId = transcriptResponse.data.id;
    console.log("Transcription en cours. ID :", transcriptId);

    // Vérifier l'état de la transcription jusqu'à sa finalisation
    let isComplete = false;
    let transcriptResult: any;

    while (!isComplete) {
      const pollingResponse = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { authorization: API_KEY },
      });

      transcriptResult = pollingResponse.data;

      if (transcriptResult.status === "completed") {
        isComplete = true;
        console.log("Transcription terminée :", transcriptResult.text);
      } else if (transcriptResult.status === "failed") {
        console.error("Échec de la transcription :", transcriptResult.error);
        return;
      } else {
        console.log("En cours...");
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Pause de 5 secondes entre les vérifications
      }
    }
  } catch (error: unknown) {
    // Gérer les erreurs de manière sécurisée
    if (axios.isAxiosError(error)) {
      console.error("Erreur lors du traitement :", error.response?.data || error.message);
    } else {
      console.error("Erreur inconnue :", error);
    }
  }
};

// Lancer la transcription
transcribeAudio();
