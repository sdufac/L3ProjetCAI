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
			extractAudio(videoData);
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

function extractAudio(video: File) {
	const reader = new FileReader();
	reader.onload = (event) => {
		if (event.target?.result != null) {
			const audioCtx = new AudioContext();

			audioCtx.decodeAudioData(event.target?.result as ArrayBuffer).then(function(audioBuffer) {

				var offlineAudioCtx = new OfflineAudioContext({
					numberOfChannels: 2,
					length: 44100 * audioBuffer.duration,
					sampleRate: 44100,
				});

				const soundSource = offlineAudioCtx.createBufferSource();
				soundSource.buffer = audioBuffer;

				var compressor = offlineAudioCtx.createDynamicsCompressor();
				compressor.threshold.setValueAtTime(-20, offlineAudioCtx.currentTime);
				compressor.knee.setValueAtTime(-30, offlineAudioCtx.currentTime);
				compressor.ratio.setValueAtTime(5, offlineAudioCtx.currentTime);
				compressor.attack.setValueAtTime(.05, offlineAudioCtx.currentTime);
				compressor.release.setValueAtTime(.25, offlineAudioCtx.currentTime);

				soundSource.connect(compressor);
				compressor.connect(offlineAudioCtx.destination);

				offlineAudioCtx.startRendering().then(function(renderedBuffer) {
					makeDownload(renderedBuffer, offlineAudioCtx.length);
				}).catch(function(err) {
					console.log(err);
				});
			}).catch((err) => {
				console.log(err);
			});
		}
	}
	reader.readAsArrayBuffer(video);
}

function makeDownload(buffer: AudioBuffer, totalSample: number) {
	var newFile = URL.createObjectURL(bufferToWave(buffer, totalSample));
	const downloadLink = document.createElement("a");
	downloadLink.href = newFile;
	downloadLink.download = "extracted-audio.wav";
	downloadLink.textContent = "Télécharger l'audio";
	document.body.appendChild(downloadLink);
}

// Convert an AudioBuffer to a Blob using WAVE representation
function bufferToWave(abuffer: AudioBuffer, len: number): Blob {
	var numOfChan = abuffer.numberOfChannels,
		length = len * numOfChan * 2 + 44,
		buffer = new ArrayBuffer(length),
		view = new DataView(buffer),
		channels = [], i, sample,
		offset = 0,
		pos = 0;

	// write WAVE header
	setUint32(0x46464952);                         // "RIFF"
	setUint32(length - 8);                         // file length - 8
	setUint32(0x45564157);                         // "WAVE"

	setUint32(0x20746d66);                         // "fmt " chunk
	setUint32(16);                                 // length = 16
	setUint16(1);                                  // PCM (uncompressed)
	setUint16(numOfChan);
	setUint32(abuffer.sampleRate);
	setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
	setUint16(numOfChan * 2);                      // block-align
	setUint16(16);                                 // 16-bit (hardcoded in this demo)

	setUint32(0x61746164);                         // "data" - chunk
	setUint32(length - pos - 4);                   // chunk length

	// write interleaved data
	for (i = 0; i < abuffer.numberOfChannels; i++) channels.push(abuffer.getChannelData(i));

	while (pos < length) {
		for (i = 0; i < numOfChan; i++) {             // interleave channels
			sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
			sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
			view.setInt16(pos, sample, true);          // write 16-bit sample
			pos += 2;
		}
		offset++                                     // next source sample
	}

	// create Blob
	return new Blob([buffer], { type: "audio/wav" });

	function setUint16(data: number) {
		view.setUint16(pos, data, true);
		pos += 2;
	}

	function setUint32(data: number) {
		view.setUint32(pos, data, true);
		pos += 4;
	}
}
