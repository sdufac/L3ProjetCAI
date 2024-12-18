document.addEventListener("DOMContentLoaded", () => {
	var buttonMic: HTMLButtonElement = document.getElementById("mic") as HTMLButtonElement;
	var buttonStop: HTMLButtonElement = document.getElementById("stop") as HTMLButtonElement;
	var buttonUpload: HTMLButtonElement = document.getElementById("upload") as HTMLButtonElement;

	buttonUpload.hidden = true;
	buttonStop.hidden = true;
	buttonMic.addEventListener("click", async () => {
		try {
			const [audioBlob, videoBlob] = await Promise.all([captureAudio(), captureVideo()]);
			upload(audioBlob, videoBlob);
			buttonStop.hidden = true;
		} catch (err) {
			console.error("ERREUR LORS DE LA CAPTURE " + err);
			location.reload();
		};
	})
});

async function captureAudio(): Promise<Blob> {
	try {
		const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

		const audioTracks = mediaStream.getAudioTracks();

		if (!audioTracks.length) {
			throw new Error("Impossible d'enregister l'audio");
		}

		const audioStream = new MediaStream(audioTracks);

		const audioOptions = {
			mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 16000 * 16,
		};

		const audioRecorder = new MediaRecorder(audioStream, audioOptions);
		const audioChunks: BlobPart[] = [];

		audioRecorder.ondataavailable = (event) => {
			if (event.data.size > 0) {
				audioChunks.push(event.data);
			}
		};

		let audioBlob: Blob = new Blob();


		const recordStopped = new Promise<void>((resolve) => {
			audioRecorder.onstop = () => {
				audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
				resolve();
			};
		})

		audioRecorder.onstart = () => {
			const startButton = document.getElementById("mic") as HTMLButtonElement;
			startButton.hidden = true;

			const stopButton = document.getElementById("stop") as HTMLButtonElement;
			stopButton.hidden = false;

			var buttonUpload: HTMLButtonElement = document.getElementById("upload") as HTMLButtonElement;
			buttonUpload.hidden = true;

			stopButton.addEventListener('click', () => {
				audioRecorder.stop();
				mediaStream.getTracks().forEach((track) => {
					track.stop();
				});
			});
		};

		audioRecorder.start();
		await recordStopped;

		return audioBlob;
	} catch (err) {
		console.error("Erreur lors de l'enregistrement audio:" + err);
		throw err;
	}
}

async function captureVideo(): Promise<Blob> {
	try {
		const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
		const videoTracks = mediaStream.getVideoTracks();

		if (!videoTracks.length) {
			throw new Error("Impossible d'enregister la vidéo");
		}

		const videoStream = new MediaStream(videoTracks);

		const videoOptions = {
			mimeType: 'video/webm',
		}

		const videoRecorder = new MediaRecorder(videoStream, videoOptions);
		const videoChunks: BlobPart[] = [];

		videoRecorder.ondataavailable = (event) => {
			if (event.data.size > 0) {
				videoChunks.push(event.data);
			}
		};

		let videoBlob: Blob = new Blob();

		const recordStopped = new Promise<void>((resolve) => {
			videoRecorder.onstop = () => {
				videoBlob = new Blob(videoChunks, { type: 'video/webm' });
				resolve();
			};
		});

		videoRecorder.onstart = () => {
			const stopButton = document.getElementById("stop") as HTMLButtonElement;
			const startButton = document.getElementById("mic") as HTMLButtonElement;
			startButton.hidden = true;

			stopButton.hidden = false;

			var buttonUpload: HTMLButtonElement = document.getElementById("upload") as HTMLButtonElement;
			buttonUpload.hidden = true;

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

		videoRecorder.start();

		await recordStopped;
		return videoBlob;
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
