import express, { Request, Response } from 'express';
import path from "path";
import multer from "multer";
import { fileURLToPath } from 'url';
import { convertToWav, convertToMp4, createCompetenceVideo } from './audioprocess.js';
import { speechToText, TextTimeCode, wordsToString } from './deepspeechprocess.js';
import { generateAccessToken, sendAllPhrase } from "./romeo.js";
import { Competence, CompetenceRome } from './romeo.js';

const app = express();
const port = 3000;

const upload = multer({ storage: multer.memoryStorage() });

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../dist')))
app.use('/upload', express.raw({ type: 'audio/wav', limit: '10mb' }));


app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../dist/html/index.html'));
});


app.post('/upload', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req: Request, res: Response) => {
	try {
		const files = req.files as {
			[fieldname: string]: Express.Multer.File[];
		};

		if (!files.audio || !files.video) {
			res.status(400).send("Fichiers manquants");
		}

		const audioFile = files.audio[0];
		const videoFile = files.video[0];

		var outputAudioPath: string = path.join(__dirname, `../dist/output/wav/${Date.now()}.wav`)
		var outputVideoPath: string = path.join(__dirname, `../dist/output/temp/${Date.now()}.mp4`)
		var outputVideoFinalPath: string = path.join(__dirname, `../dist/output/final/${Date.now()}.mp4`)

		await convertToWav(audioFile.buffer, outputAudioPath);
		await convertToMp4(videoFile.buffer, outputVideoPath);

		console.log("Conversion terminée");

		const phrases: TextTimeCode[] = speechToText(outputAudioPath);
		console.log("Tableau de phrase");
		phrases.forEach((phrase) => {
			console.log(`text=${phrase.text} start_time=${phrase.start_time} end_time=${phrase.end_time}`);
		});

		const text = wordsToString(phrases);
		console.log('resultat de la transcription :', text);

		const token = await generateAccessToken();
		console.log("Token: " + token);

		const competences = await sendAllPhrase(phrases);
		competences.forEach((competence) => {
			if (competence.competencesRome.length > 0) {
				competence.competencesRome.forEach((competenceRome) => {
					console.log("intitule=" + competence.intitule + " competence=" + competenceRome.libelleCompetence);
				});
			} else {
				console.log("Aucune compétences trouvé pour: " + competence.intitule);
			}
		});
		await createCompetenceVideo(competences, phrases, outputVideoPath, outputVideoFinalPath);

		res.json({ result: text });
	} catch (err) {
		console.error("Une ereur s'est produite" + err);
	}
});

app.listen(port, () => {
	return console.log(`Express is listening at http://localhost:${port}`);
});

