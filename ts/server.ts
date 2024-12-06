import express, { Request, Response } from 'express';
import * as path from "path";
import { convertToWav } from './audioprocess';

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '../dist')))
app.use('/upload', express.raw({ type: 'audio/wav', limit: '10mb' }));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.post('/upload', (req: Request, res: Response) => {
	const audioBuffer = req.body as Buffer;
	convertToWav(audioBuffer).then(() => {
		console.log('Conversion terminée');
	}).catch((err) => {
		console.error('Erreur lors de la convertion', err);
	});
	res.json({ message: 'Blob reçu' });
});

app.listen(port, () => {
	return console.log(`Express is listening at http://localhost:${port}`);
});

