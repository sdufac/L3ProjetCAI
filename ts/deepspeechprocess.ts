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

	const phrase: TextTimeCode[] = [];
	const tokens = metadata.transcripts[0].tokens;

	let currentPhrase: string = '';
	let startTime: number = 0;

	//Algo qui transforme le tableau de caractère en tableau de phrase en gardant les timestamp pour chaque phrase
	tokens.forEach((token, index) => {
		if (token.text === ' ') {
			if (tokens[index + 1].start_time - tokens[index - 1].start_time > 0.5) {
				currentPhrase += "." + token.text;
				phrase.push({
					text: currentPhrase,
					start_time: startTime,
					end_time: tokens[index - 1].start_time,
				})
				currentPhrase = '';
			} else {
				currentPhrase += token.text;
			}
		} else {
			if (currentPhrase.length === 0) {
				startTime = token.start_time;
				currentPhrase += token.text.toUpperCase();
			} else {
				currentPhrase += token.text;
			}
		}

		if (index === tokens.length - 1) {
			currentPhrase += ".";
			phrase.push({
				text: currentPhrase,
				start_time: startTime,
				end_time: token.start_time,
			})
		}
	});

	return phrase;
};

export function wordsToString(words: TextTimeCode[]): string {
	var result: string = '';

	for (let i = 0; i < words.length; i++) {
		result = result + words[i].text;
	}

	return result;
}
