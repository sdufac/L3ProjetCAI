import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import stream from 'stream';
import * as fs from 'fs';
import { exec, ExecException } from 'child_process';
import { Competence, CompetenceRome } from './romeo.js';
import { TextTimeCode } from './deepspeechprocess.js';


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

export function extractSegment(inputPath: string, startTime: number, endTime: number, outputPath: string): Promise<void> {
	return new Promise((resolve, reject) => {
		ffmpeg(inputPath)
			.setStartTime(startTime)
			.setDuration(endTime - startTime)
			.outputOptions('-c copy')
			.save(outputPath)
			.on('end', () => {
				console.log('Fichier segmenté avec succés');
				resolve();
			})
			.on('error', (err) => {
				console.error('Erreur lors de la segmentation du ficher' + err);
				reject();
			})
	});
}

export function concatSegments(segments: string[], outputPath: string): Promise<void> {
	return new Promise((resolve, reject) => {
		//Pour concatener des video avec ffmpeg il faut faire un fichier texte avec pour chaque
		//file 'path vers la video'
		const concatFileContent = segments.map(s => `file '${s}'`).join('\n')
		const concatFilePath = 'segment.txt';
		fs.writeFileSync(concatFilePath, concatFileContent);

		for (let i = 0; i < segments.length; i++) {
			if (!fs.existsSync(segments[i])) {
				throw new Error("Segment introuvable: " + segments[i]);
			}
		}

		ffmpeg()
			.input(concatFilePath)
			.inputFormat('concat')
			.inputOptions('-safe 0')
			.outputOptions('-c copy')
			.output(outputPath)
			.on('end', () => {
				fs.unlinkSync(concatFilePath);
				resolve();
			})
			.on('error', (err) => {
				console.error('Erreur lors de la segmentation du ficher' + err);
				reject();
			})
			.run();
	});
}

export async function createCompetenceVideo(competences: Competence[], phrases: TextTimeCode[], inputVideo: string, outputVideo: string): Promise<void> {
	if (competences.length != phrases.length) {
		throw new Error("Tableau de compétence et de phrases ne correspondent pas");
	}

	const segmentsPaths: string[] = [];

	try {
		for (let i = 0; i < competences.length; i++) {
			if (competences[i].competencesRome.length > 0 && phrases[i].text === competences[i].intitule) {
				console.log("PHRASES=" + phrases[i].text + " COMPETENCES=" + competences[i].intitule);
				const segmentPath = `segment${i}.mp4`;
				await extractSegment(inputVideo, phrases[i].start_time, phrases[i].end_time, segmentPath);
				segmentsPaths.push(segmentPath);
			}
		}

		if (segmentsPaths.length === 0) {
			return;
		}
		await concatSegments(segmentsPaths, outputVideo);
		console.log("Vidéo finalisé");
	} catch (err) {
		console.error("Erreur lors de la concatenation des segments: " + err);
	} finally {
		for (const seg of segmentsPaths) {
			if (fs.existsSync(seg)) {
				try {
					fs.unlinkSync(seg);
				} catch (err) {
					console.error(`Erreur lors de la suppression du segment ${seg}`);
				}

			}
		}
	}
};
