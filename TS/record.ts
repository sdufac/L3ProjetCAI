// Importer les dépendances nécessaires
const startRecordingButton = document.getElementById("startRecording") as HTMLButtonElement;
const stopRecordingButton = document.getElementById("stopRecording") as HTMLButtonElement;
const videoElement = document.getElementById("videoPreview") as HTMLVideoElement;

let mediaRecorder: MediaRecorder;
let recordedChunks: Blob[] = [];

// Fonction pour démarrer la capture vidéo et audio
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    videoElement.srcObject = stream;
    videoElement.play();

    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.start();
    console.log("Enregistrement démarré...");
  } catch (error) {
    console.error("Erreur lors de la capture :", error);
  }
}

// Fonction pour arrêter l'enregistrement et sauvegarder le fichier
function stopRecording() {
  mediaRecorder.stop();
  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: "video/mp4" });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "recorded-video.mp4";
    downloadLink.textContent = "Télécharger la vidéo";
    document.body.appendChild(downloadLink);

    console.log("Enregistrement terminé. Fichier prêt à être téléchargé.");
  };
}

// Ajouter les écouteurs d'événements
startRecordingButton.addEventListener("click", startRecording);
stopRecordingButton.addEventListener("click", stopRecording);
