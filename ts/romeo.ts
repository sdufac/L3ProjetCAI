import fetch from "node-fetch";

import { TextTimeCode } from "./deepspeechprocess.js";

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

export async function sendToRomeo(token: string, text: string): Promise<any> {
	try {
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

		const data = await response.json();
		return data;
	} catch (err) {
		console.error('Erreur lors de lenvoi  ROMEOv2: ' + err);
	}
}

export async function sendAllPhrase(phrases: TextTimeCode[]) {
	const token = await generateAccessToken();

	let i: number = 0;

	const timer = setInterval(async function() {
		const competence = await sendToRomeo(token, phrases[i].text);
		console.log("Competences: " + JSON.stringify(competence, null, 2));
		i++
		if (i === phrases.length) {
			clearInterval(timer);
		}
	}, 1000);
}
