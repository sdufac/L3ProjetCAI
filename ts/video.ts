document.addEventListener("DOMContentLoaded", () => {
	var button: HTMLButtonElement = document.getElementById("extract") as HTMLButtonElement

	const fileInput: HTMLInputElement = document.getElementById("fileInput") as HTMLInputElement;


	button.addEventListener("click", () => {
		const resultDiv: HTMLDivElement = document.getElementById("result") as HTMLDivElement;

		const videoData = fileInput.files?.[0];
		if (!videoData) {
			resultDiv.innerHTML = "Aucun fichier séléctionné";
		} else {
			resultDiv.innerHTML = "Vidéo transferée: " + videoData.type;
			createVideo(videoData);
		}
	});
});

async function createVideo(videoFile: Blob) {
	const videoElement = document.createElement("video");
	videoElement.src = URL.createObjectURL(videoFile);
	videoElement.load();

	await videoElement.play();

	const audioContext = new AudioContext();
	const source = audioContext.createMediaElementSource(videoElement);
	const destination = audioContext.createMediaStreamDestination();

	source.connect(destination);
	source.connect(audioContext.destination);

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
	// Démarrer l'enregistrement
	mediaRecorder.start();

	// Arreter l'enregistrement quand il dépasse la longueur de la vidéo
	setTimeout(() => {
		mediaRecorder.stop();
	}, videoElement.duration * 1000);
}
