document.addEventListener("DOMContentLoaded", () => {
	var buttonMic: HTMLButtonElement = document.getElementById("mic") as HTMLButtonElement;
	var buttonStop: HTMLButtonElement = document.getElementById("stop") as HTMLButtonElement;
	var buttonUpload: HTMLButtonElement = document.getElementById("upload") as HTMLButtonElement;

	buttonUpload.hidden = true;
	buttonStop.hidden = true;
	buttonMic.addEventListener("click", async () => {
		try {
			const [audioBlob, videoBlob] = await captureVideo();
			upload(audioBlob, videoBlob);
			buttonStop.hidden = true;
		} catch (err) {
			console.error("ERREUR LORS DE LA CAPTURE " + err);
			location.reload();
		};
	})
});

async function captureVideo(): Promise<[Blob, Blob]> {
	try {
		const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
		const videoTracks = mediaStream.getTracks();
		const audioTracks = mediaStream.getAudioTracks();

		if (!videoTracks.length || !audioTracks.length) {
			throw new Error("Impossible d'enregister la vidéo");
		}

		const videoStream = new MediaStream(videoTracks);
		const audioStream = new MediaStream(audioTracks);

		const videoOptions = {
			mimeType: 'video/webm;codecs=vp8,opus',
		}

		const audioOptions = {
			mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 16000 * 16,
		};

		const videoRecorder = new MediaRecorder(videoStream, videoOptions);
		const videoChunks: BlobPart[] = [];

		const audioRecorder = new MediaRecorder(audioStream, audioOptions);
		const audioChunks: BlobPart[] = [];

		videoRecorder.ondataavailable = (event) => {
			if (event.data.size > 0) {
				videoChunks.push(event.data);
			}
		};

		audioRecorder.ondataavailable = (event) => {
			if (event.data.size > 0) {
				audioChunks.push(event.data);
			}
		};

		let videoBlob: Blob = new Blob();
		let audioBlob: Blob = new Blob();

		const videoRecordStopped = new Promise<void>((resolve) => {
			videoRecorder.onstop = () => {
				videoBlob = new Blob(videoChunks, { type: 'video/webm' });
				resolve();
			};
		});

		const audioRecordStopped = new Promise<void>((resolve) => {
			audioRecorder.onstop = () => {
				audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
				resolve();
			}
		});

		videoRecorder.onstart = () => {
			const startButton = document.getElementById("mic") as HTMLButtonElement;
			startButton.hidden = true;

			const stopButton = document.getElementById("stop") as HTMLButtonElement;
			stopButton.hidden = false;

			const videoElement = document.getElementById("video") as HTMLVideoElement;
			videoElement.srcObject = mediaStream;
			videoElement.onloadedmetadata = () => {
				videoElement.hidden = false;
				videoElement.play()
			};

			stopButton.addEventListener('click', () => {
				videoElement.pause();
				videoElement.hidden = true;

				videoRecorder.stop();
				mediaStream.getTracks().forEach((track) => {
					track.stop();
				});
			});
		};

		audioRecorder.onstart = () => {
			const startButton = document.getElementById("mic") as HTMLButtonElement;
			startButton.hidden = true;

			const stopButton = document.getElementById("stop") as HTMLButtonElement;
			stopButton.hidden = false;

			stopButton.addEventListener('click', () => {
				audioRecorder.stop();
				mediaStream.getTracks().forEach((track) => {
					track.stop();
				});
			});
		};

		videoRecorder.start();
		audioRecorder.start();

		await Promise.all([videoRecordStopped, audioRecordStopped]);
		return [audioBlob, videoBlob];
	} catch (err) {
		console.error("Erreur lors de l'enregistrement video:" + err);
		throw err;
	}
}

async function upload(audioBlob: Blob, videoBlob: Blob) {
	const resultDiv: HTMLDivElement = document.getElementById("result") as HTMLDivElement;
	resultDiv.innerHTML = "Chargement...";

	const formData = new FormData();
	formData.append('audio', audioBlob, 'audio.webm');
	formData.append('video', videoBlob, 'video.webm');

	const response = await fetch('http://localhost:3000/upload', {
		method: 'POST',
		body: formData,
	});

	if (!response.ok) {
		throw new Error(`Erreur lors de l'envoi des fichiers : ${response.statusText}`);
	}

	const data = await response.json();
	console.log("Réponses", data);

	resultDiv.innerHTML = "<h3>Résultat de la transcription</h3>" + data.result
		+ "<br> Compétences :";

	const reloadButton: HTMLButtonElement = document.getElementById("reloadButton") as HTMLButtonElement;
	reloadButton.hidden = false;
	reloadButton.onclick = () => {
		location.reload();
	};
}
