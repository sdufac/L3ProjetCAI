import express, { Request, Response } from 'express';
import path from "path";
import multer from "multer";
import { fileURLToPath } from 'url';
import { convertToWav, convertToMp4, createCompetenceVideo } from './audioprocess.js';
import { speechToText, TextTimeCode, wordsToString } from './deepspeechprocess.js';
import { generateAccessToken, sendAllPhrase } from "./romeo.js";
import { Competence, CompetenceRome } from './romeo.js';
import { sendToBdd, insertCompetence, createTable } from './bdd.js';
import { getCities } from './city.js';


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

		const outputName = Date.now();

		var outputAudioPath: string = path.join(__dirname, `../dist/output/wav/${outputName}.wav`)
		var outputVideoPath: string = path.join(__dirname, `../dist/output/temp/${outputName}.mp4`)
		var outputVideoFinalPath: string = path.join(__dirname, `../dist/output/final/${outputName}.mp4`)

		await convertToWav(audioFile.buffer, outputAudioPath);
		await convertToMp4(videoFile.buffer, outputVideoPath);

		console.log("Conversion terminée");

		const phrases: TextTimeCode[] = speechToText(outputAudioPath);
		const cities: TextTimeCode[] = getCities(phrases);

		const text = wordsToString(phrases);
		console.log('resultat de la transcription :', text);

		const token = await generateAccessToken();
		console.log("Token: " + token);

		const competences = await sendAllPhrase(phrases);
		const phrasesWithComp: TextTimeCode[] = [];

		competences.forEach((competence) => {
			if (competence.competencesRome.length > 0) {
				competence.competencesRome.forEach((competenceRome) => {
					console.log("intitule=" + competence.intitule + " competence=" + competenceRome.libelleCompetence);
				});
				phrases.forEach((phrase) => {
					if (competence.intitule == phrase.text) {
						phrasesWithComp.push(phrase);
					}
				});
			} else {
				console.log("Aucune compétences trouvé pour: " + competence.intitule);
			}
		});

		const finalTab = phrasesWithComp.concat(cities);

		if (finalTab.length > 0) {
			await createCompetenceVideo(finalTab, outputVideoPath, outputVideoFinalPath);
			const dbPath = path.join(__dirname, '../dist/db', 'db.sqlite');

			await createTable(dbPath);
			const videoId = await sendToBdd(outputName + ".mp4", dbPath);
			console.log("Video envoyé en BDD");
			for (let i = 0; i < competences.length; i++) {
				for (let j = 0; j < competences[i].competencesRome.length; j++) {
					const intitule = competences[i].competencesRome[j].libelleCompetence;
					const codeRome = competences[i].competencesRome[j].codeCompetence;
					await insertCompetence(dbPath, intitule, codeRome, videoId);
					console.log("Competence envoyé en BDD");
				}
			}
		}

		let compString = '';

		finalTab.forEach((text) => {
			compString = compString + text.text + ', ';
		});

		res.json({ result: text, competence: compString });
	} catch (err) {
		console.error("Une ereur s'est produite" + err);
	}
});

app.listen(port, () => {
	return console.log(`Express is listening at http://localhost:${port}`);
});

