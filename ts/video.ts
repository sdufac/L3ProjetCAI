document.addEventListener("DOMContentLoaded", () => {
	var buttonMic: HTMLButtonElement = document.getElementById("mic") as HTMLButtonElement;
	var buttonStop: HTMLButtonElement = document.getElementById("stop") as HTMLButtonElement;
	var buttonUpload: HTMLButtonElement = document.getElementById("upload") as HTMLButtonElement;
	buttonUpload.hidden = true;
	buttonStop.hidden = true;

	buttonMic.addEventListener("click", () => {
		getUserMicrophone();
		getUserCamera();
	})
});

async function getUserMicrophone() {
	navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((mediaStr) => {
		const mediaStream = mediaStr;
		const audioCtx = new AudioContext();

		const source = audioCtx.createMediaStreamSource(mediaStream);
		const destination = audioCtx.createMediaStreamDestination();

		source.connect(destination);

		const mediaRecorder = new MediaRecorder(destination.stream);
		const audioChunks: Blob[] = [];

		mediaRecorder.ondataavailable = (event) => {
			audioChunks.push(event.data);
		}

		mediaRecorder.onstart = () => {
			const startButton = document.getElementById("mic") as HTMLButtonElement;
			startButton.hidden = true;

			const stopButton = document.getElementById("stop") as HTMLButtonElement;
			stopButton.hidden = false;

			var buttonUpload: HTMLButtonElement = document.getElementById("upload") as HTMLButtonElement;
			buttonUpload.hidden = true;

			stopButton.addEventListener('click', () => {
				mediaRecorder.stop();
				mediaStr.getTracks().forEach((track) => {
					track.stop();
				});
			});
		}

		mediaRecorder.onstop = () => {
			const startButton = document.getElementById("mic") as HTMLButtonElement;
			startButton.hidden = false;

			const stopButton = document.getElementById("stop") as HTMLButtonElement;
			stopButton.hidden = true;

			var buttonUpload: HTMLButtonElement = document.getElementById("upload") as HTMLButtonElement;
			buttonUpload.hidden = false;


			// Créer un fichier audio à partir de l'enregistrement
			const audioBlob = new Blob(audioChunks, { type: "audio/wav" });

			buttonUpload.addEventListener('click', () => {
				uploadAudio(audioBlob);
			});

			//Créez un lien pour télécharger l'audio
			const audioUrl = URL.createObjectURL(audioBlob);
			const downloadLink = document.createElement("a");
			downloadLink.href = audioUrl;
			downloadLink.download = "extracted-audio.wav";
			downloadLink.textContent = "Télécharger l'audio";
			document.body.appendChild(downloadLink);
		};

		// Démarrer l'enregistrement
		mediaRecorder.start();
	}).catch((err) => {
		console.log(err);
	});
}

async function getUserCamera() {
	navigator.mediaDevices.getUserMedia({ audio: false, video: { width: 250 } }).then((mediaStr) => {
		const videoElement = document.getElementById("video") as HTMLVideoElement;
		const stopButton = document.getElementById("stop") as HTMLButtonElement;
		videoElement.srcObject = mediaStr;
		videoElement.onloadedmetadata = () => {
			videoElement.hidden = false;
			videoElement.play()

			stopButton.onclick = () => {
				videoElement.pause();
				videoElement.hidden = true;
				mediaStr.getTracks().forEach((track) => {
					track.stop();
				});
			};
		};
	}).catch((err) => {
		console.log(err);
	});
}

async function uploadAudio(audioBlob: Blob) {
	try {
		const response = await fetch('http://localhost:3000/upload', {
			method: 'POST',
			headers: {
				'Content-type': 'audio/wav',
			},
			body: audioBlob,
		});

		const data = await response.json();
		console.log("Réponses", data);
	} catch (error) {
		console.error('Audio non envoyé', error);
	}
}
