import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import stream from 'stream';
import * as fs from 'fs';
import { exec, ExecException } from 'child_process';


export async function convertToWav(audioBuffer: Buffer, outputPath: string): Promise<void> {
	ffmpeg.setFfmpegPath(ffmpegInstaller.path);

	return new Promise((resolve, reject) => {
		const readableStream = new stream.Readable();
		readableStream.push(audioBuffer);
		readableStream.push(null);

		ffmpeg(readableStream)
			.audioChannels(1)
			.audioFrequency(16000)
			.audioBitrate('16k')
			.toFormat('wav')
			.on('end', () => {
				console.log('Fichier Wav généré avec succés');
				resolve();
			})
			.on('error', (err) => {
				console.error('Erreur lors de la conversion du fichier audio', err);
				reject();
			})
			.save(outputPath);
	});
};

export async function convertToMp4(videoBuffer: Buffer, outputPath: string): Promise<void> {
	ffmpeg.setFfmpegPath(ffmpegInstaller.path);

	return new Promise((resolve, reject) => {
		const readableStreamVideo = new stream.Readable();
		readableStreamVideo.push(videoBuffer);
		readableStreamVideo.push(null);

		ffmpeg(readableStreamVideo)
			.inputFormat('webm')
			.outputOptions('-c:v libx264')
			.outputOptions('-c:a aac')
			.format('mp4')
			.on('end', () => {
				console.log('Fichier mp4 généré avec succés');
				resolve();
			})
			.on('error', (err) => {
				console.error('Erreur lors de la conversion du fichier video' + err);
				reject();
			})
			.save(outputPath);
	});
};
