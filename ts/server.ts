import express, { Request, Response } from 'express';
import * as path from "path";
import { convertToWav } from './audioprocess';
import { speechToText } from './deepspeechprocess';

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '../dist')))
app.use('/upload', express.raw({ type: 'audio/wav', limit: '10mb' }));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.post('/upload', (req: Request, res: Response) => {
	const audioBuffer = req.body as Buffer;
	var outputPath: string = path.join(__dirname, '../dist/audioFile/testwav.wav')
	convertToWav(audioBuffer, outputPath).then(() => {
		console.log('Conversion terminée');
		try {
			const text = speechToText(outputPath);
			console.log('resultat de la transcription :', text);
			res.json({ message: text });
		} catch (err) {
			console.error('une erreur s\'est produite lors de la transcription');
		};
	}).catch((err) => {
		console.error('Erreur lors de la convertion', err);
	});
});

app.listen(port, () => {
	return console.log(`Express is listening at http://localhost:${port}`);
});

