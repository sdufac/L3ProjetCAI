import * as DeepSpeech from "deepspeech";
import * as path from "path";
import * as fs from "fs";


export function speechToText(audioPath: string): string {
	const MODEL_PATH = path.join(__dirname, "dsModel", "deepspeech-0.9.3-models.pbmm");
	const SCORER_PATH = path.join(__dirname, "dsModel", "deepspeech-0.9.3-models.scorer");

	const FRENCH_MODEL_PATH = path.join(__dirname, "dsModel", "frenchTS", "output_graph.pbmm");
	const FRENCH_SCORER_PATH = path.join(__dirname, "dsModel", "frenchTS", "kenlm.scorer");

	const model = new DeepSpeech.Model(FRENCH_MODEL_PATH);
	model.enableExternalScorer(FRENCH_SCORER_PATH);

	const audioData = fs.readFileSync(audioPath);

	const transcription = model.stt(audioData);

	return transcription;
}
