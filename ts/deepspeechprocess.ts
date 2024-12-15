import * as DeepSpeech from "deepspeech";
import * as path from "path";
import * as fs from "fs";
import { __dirname } from "./server.js"

export type WordTimeCode = {
	word: string;
	start_time: number;
	end_time: number;
};

export function speechToText(audioPath: string): WordTimeCode[] {
	const FRENCH_MODEL_PATH = path.join(__dirname, "dsModel", "frenchTS", "output_graph.pbmm");
	const FRENCH_SCORER_PATH = path.join(__dirname, "dsModel", "frenchTS", "kenlm.scorer");

	const model = new DeepSpeech.Model(FRENCH_MODEL_PATH);
	model.enableExternalScorer(FRENCH_SCORER_PATH);

	const audioData = fs.readFileSync(audioPath);

	const metadata = model.sttWithMetadata(audioData, 1);

	const words = metadata.transcripts[0].tokens.map((token) => ({
		word: token.text,
		start_time: token.start_time,
		end_time: token.start_time + token.timestep,
	}));

	return words;
};

export function wordsToString(words: WordTimeCode[]): string {
	var result: string = '';

	for (let i = 0; i < words.length; i++) {
		result = result + words[i].word;
	}

	return result;
}
