import * as DeepSpeech from "deepspeech";
import * as path from "path";
import * as fs from "fs";
import { __dirname } from "./server.js"

export type TextTimeCode = {
	text: string;
	start_time: number;
	end_time: number;
};

export function speechToText(audioPath: string): TextTimeCode[] {
	const FRENCH_MODEL_PATH = path.join(__dirname, "dsModel", "frenchTS", "output_graph.pbmm");
	const FRENCH_SCORER_PATH = path.join(__dirname, "dsModel", "frenchTS", "kenlm.scorer");

	const model = new DeepSpeech.Model(FRENCH_MODEL_PATH);
	model.enableExternalScorer(FRENCH_SCORER_PATH);

	const audioData = fs.readFileSync(audioPath);

	const metadata = model.sttWithMetadata(audioData, 1);

	let letters: TextTimeCode[] = metadata.transcripts[0].tokens.map((token) => ({
		text: token.text,
		start_time: token.start_time,
		end_time: 0,
	}));

	letters[0].text = letters[0].text.toUpperCase();

	for (let i = 0; i < letters.length - 1; i++) {
		console.log("MOT NUMERO " + i + " start_time=" + letters[i].start_time + " text=" + letters[i].text);
		if (letters[i].text == ' ') {
			if (letters[i + 1].start_time - letters[i - 1].start_time > 0.5) {
				letters[i - 1].text = letters[i - 1].text + ".";
				letters[i + 1].text = letters[i + 1].text.toUpperCase();
			}
		}
	}

	return letters;
};

export function wordsToString(words: TextTimeCode[]): string {
	var result: string = '';

	for (let i = 0; i < words.length; i++) {
		result = result + words[i].text;
	}

	return result;
}
