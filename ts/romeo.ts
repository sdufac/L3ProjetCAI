import fetch from "node-fetch";

import { TextTimeCode } from "./deepspeechprocess.js";

export type CompetenceRome = {
	codeCompetence: string;
	libelleCompetence: string;
	scorePrediction: number;
	typeCompetence: string;
};

export type Competence = {
	competencesRome: CompetenceRome[];
	identifiant: string;
	intitule: string;
	uuidInference: string;
}

export type RomeoResponse = Competence[];

export async function generateAccessToken(): Promise<string> {
	const tokenUrl = "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire";
	const body = new URLSearchParams({
		'grant_type': 'client_credentials',
		'client_id': 'PAR_extractorcv_5f12c63968ebd554aee46c6817ad6c2dda646f268b5fe289f3575ee2a0d50845',
		'client_secret': 'e22fc70e2f278d63f4d0e535591e264a8e90434a0e2e47fcb0a17d0dad92baa3',
		'scope': 'api_romeov2'
	})

	const response = await fetch(tokenUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Erreur lors de la génération du token: ${response.statusText}. ${error}`);
	}

	const tokenData = await response.json() as { access_token: string };
	return tokenData.access_token;
}

export async function sendToRomeo(token: string, text: string): Promise<RomeoResponse> {
	const url = "https://api.francetravail.io/partenaire/romeo/v2/predictionCompetences"

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			competences: [
				{
					intitule: text,
					identifiant: "123"
				}
			],
			options: {
				nomAppelant: "ExtractorCV",
				nbResultats: 3,
				seuilScorePrediction: 0.8
			}
		})
	});

	if (!response.ok) {
		const errorDetails = await response.text();
		throw new Error(`Erreur lors de l'envoi à ROMEOv2 : ${errorDetails}`);
	}

	const dataResponse = await response.json();
	return dataResponse as RomeoResponse;
}

export async function sendAllPhrase(phrases: TextTimeCode[]): Promise<Competence[]> {
	const token = await generateAccessToken();
	let competences: Competence[] = [];

	for (let i = 0; i < phrases.length; i++) {
		await new Promise(resolve => setTimeout(resolve, 1000));

		const response = await sendToRomeo(token, phrases[i].text);
		const competence = response[0];

		competences.push(competence);
	}

	return competences;
}
