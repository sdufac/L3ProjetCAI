//TODO Enregistrer le son du micro au lieu d'enregistrer le son directement
document.addEventListener("DOMContentLoaded", () => {
	var buttonMic: HTMLButtonElement = document.getElementById("mic") as HTMLButtonElement

	buttonMic.addEventListener("click", () => {
		getUserMicrophone();
	})
});

async function getUserMicrophone() {

	navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((mediaStr) => {
		const mediaStream = mediaStr;
		const audioCtx = new AudioContext();

		const source = audioCtx.createMediaStreamSource(mediaStream);
		const destination = audioCtx.createMediaStreamDestination();

		source.connect(destination);
		source.connect(audioCtx.destination);

		const mediaRecorder = new MediaRecorder(destination.stream);
		const audioChunks: Blob[] = [];

		mediaRecorder.ondataavailable = (event) => {
			audioChunks.push(event.data);
		}

		mediaRecorder.onstop = () => {
			// Créer un fichier audio à partir de l'enregistrement
			const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
			const audioUrl = URL.createObjectURL(audioBlob);

			//Créez un lien pour télécharger l'audio
			const downloadLink = document.createElement("a");
			downloadLink.href = audioUrl;
			downloadLink.download = "extracted-audio.wav";
			downloadLink.textContent = "Télécharger l'audio";
			document.body.appendChild(downloadLink);
		};

		mediaRecorder.onstart = () => {
			const stopButton = document.getElementById("mic") as HTMLButtonElement;
			stopButton.innerHTML = "Stop";

			stopButton.addEventListener('click', () => {
				mediaRecorder.stop();
			});
		}

		// Démarrer l'enregistrement
		mediaRecorder.start();
	}).catch((err) => {
		console.log(err);
	});
}
