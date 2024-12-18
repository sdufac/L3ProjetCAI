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
	model.setBeamWidth(4096);
	model.setScorerAlphaBeta(0.5919543900530122, 1.6082513974258137);

	const audioData = fs.readFileSync(audioPath);

	const metadata = model.sttWithMetadata(audioData, 1);

	const phrase: TextTimeCode[] = [];
	const letters: TextTimeCode[] = [];
	const tokens = metadata.transcripts[0].tokens;

	let currentPhrase: string = '';
	let startTime: number = 0;

	//Copie du tableau de lettre fait par deepspeech pour pouvoir ajouster les valeurs de start_time
	tokens.forEach((token, index) => {
		if (index < tokens.length - 1) {
			letters.push({
				text: token.text,
				start_time: token.start_time,
				end_time: tokens[index + 1].start_time,
			})
		} else {
			letters.push({
				text: token.text,
				start_time: token.start_time,
				end_time: token.start_time,
			})
		}
	});

	//Ajustement des valeurs de start_time qui fonctionne mal en fonction des pauses
	letters.forEach((letter, index) => {
		if (index > 0 && letters[index - 1].text != ' ') {
			if (letter.start_time - letters[index - 1].start_time > 0.5) {
				letter.start_time = letters[index - 1].start_time + 0.1;
			}
		}
	})

	//Algo qui transforme le tableau de caractère en tableau de phrase en gardant les timestamp pour chaque phrase
	//et met également la ponctuation (point et majuscule) en fonction de l'espacement entre les mots.
	//La ponctuation n'a pas pour but d'être exact mais seulement à séparer le texte en plusieurs morceaux pour pouvoir isoler
	//les compétences
	letters.forEach((token, index) => {
		console.log("LETTRE" + index + " text=" + token.text + " start_time=" + token.start_time);
		if (token.text === ' ') {
			if (index > 0 && index < letters.length - 1) {
				if (letters[index + 1].start_time - letters[index - 1].start_time > 0.5) {
					currentPhrase += "." + token.text;
					phrase.push({
						text: currentPhrase,
						start_time: startTime,
						end_time: letters[index - 1].start_time,
					})
					currentPhrase = '';
				} else {
					currentPhrase += token.text;
				}
			}
		} else {
			if (currentPhrase.length === 0) {
				startTime = token.start_time;
				currentPhrase += token.text.toUpperCase();
			} else {
				currentPhrase += token.text;
			}
		}

		if (index === letters.length - 1) {
			currentPhrase += ".";
			phrase.push({
				text: currentPhrase,
				start_time: startTime,
				end_time: token.start_time,
			});
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
