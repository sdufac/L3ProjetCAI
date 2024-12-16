import express, { Request, Response } from 'express';
import path from "path";
import { fileURLToPath } from 'url';
import { convertToWav } from './audioprocess.js';
import { speechToText, TextTimeCode, wordsToString } from './deepspeechprocess.js';
import { generateAccessToken, sendToRomeo } from "./romeo.js";

const app = express();
const port = 3000;

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../dist')))
app.use('/upload', express.raw({ type: 'audio/wav', limit: '10mb' }));


app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../dist/html/index.html'));
});

app.post('/upload', async (req: Request, res: Response) => {
	try {
		const audioBuffer = req.body as Buffer;
		var outputPath: string = path.join(__dirname, '../dist/audioFile/testwav.wav')

		await convertToWav(audioBuffer, outputPath);
		console.log("Conversion terminée");

		const words: TextTimeCode[] = speechToText(outputPath);
		const text = wordsToString(words);
		console.log('resultat de la transcription :', text);

		const token = await generateAccessToken();
		console.log("Token: " + token);

		const competence = await sendToRomeo(token, text);
		console.log("Competences: " + JSON.stringify(competence, null, 2));

		res.json({ result: text });

	} catch (err) {
		console.error("Une erreur sest produite" + err);
	};
});

app.get('/upload/result', (req: Request, res: Response) => {
	res.sendFile(path.join(__dirname, '../dist/html/resultat.html'))
});

app.listen(port, () => {
	return console.log(`Express is listening at http://localhost:${port}`);
});

