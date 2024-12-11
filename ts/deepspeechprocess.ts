import * as DeepSpeech from "deepspeech";
import * as path from "path";
import * as fs from "fs";


export function speechToText(audioPath: string): string {
	const MODEL_PATH = path.join(__dirname, "dsModel", "deepspeech-0.9.3-models.pbmm");
	const SCORER_PATH = path.join(__dirname, "dsModel", "deepspeech-0.9.3-models.scorer");

	const model = new DeepSpeech.Model(MODEL_PATH);
	model.enableExternalScorer(SCORER_PATH);

	const audioData = fs.readFileSync(audioPath);

	const transcription = model.stt(audioData);

	return transcription;
}
