import * as path from "path";
import * as fs from "fs";

import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import stream from 'stream';

export async function convertToWav(audioBuffer: Buffer): Promise<void> {
	ffmpeg.setFfmpegPath(ffmpegInstaller.path);


	return new Promise((resolve, reject) => {
		const readableStream = new stream.Readable();
		readableStream.push(audioBuffer);
		readableStream.push(null);

		ffmpeg(readableStream)
			.inputFormat('s16le')
			.audioCodec('pcm_s16le')
			.audioChannels(1)
			.audioFrequency(16000)
			.format('wav')
			.on('end', () => {
				console.log('Fichier Wav généré avec succés');
				resolve();
			})
			.on('error', (err) => {
				console.error('Erreur lors de la convertion du fichier', err);
				reject();
			})
			.save(path.join(__dirname, '../dist/audioFile/testwav.wav'));
	});
}
