document.addEventListener("DOMContentLoaded", () => {
	var buttonMic: HTMLButtonElement = document.getElementById("mic") as HTMLButtonElement
	var buttonStop: HTMLButtonElement = document.getElementById("stop") as HTMLButtonElement
	buttonStop.hidden = true;

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
			const startButton = document.getElementById("mic") as HTMLButtonElement;
			startButton.hidden = false;

			const stopButton = document.getElementById("stop") as HTMLButtonElement;
			stopButton.hidden = true;
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
			const startButton = document.getElementById("mic") as HTMLButtonElement;
			startButton.hidden = true;

			const stopButton = document.getElementById("stop") as HTMLButtonElement;
			stopButton.hidden = false;

			stopButton.addEventListener('click', () => {
				mediaRecorder.stop();
				mediaStr.getTracks().forEach((track) => {
					track.stop();
				});
			});
		}

		// Démarrer l'enregistrement
		mediaRecorder.start();
	}).catch((err) => {
		console.log(err);
	});
}
