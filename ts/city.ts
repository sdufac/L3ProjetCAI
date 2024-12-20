import fs from 'fs';
import path from 'path';
import { TextTimeCode } from './deepspeechprocess.js';
import { __dirname, __filename } from './server.js';

export function getCities(phrases: TextTimeCode[]): TextTimeCode[] {
	const citiesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../dist/cities/cities.json'), 'utf-8'));

	const cityNameSet = new Set(citiesData.cities.map((city: any) => city.label.toLowerCase()));

	const foundCities: TextTimeCode[] = [];

	for (let i = 0; i < phrases.length; i++) {
		const phrase = phrases[i].text.replace(/[.,/#!$%^&*;:{}=-_`~()]/g, '');
		const phrase2 = phrase.toLowerCase().split(/\s+/);
		phrase2.forEach((mot) => {
			console.log("mot a tester: " + mot);
			if (cityNameSet.has(mot)) {
				foundCities.push(phrases[i]);
				console.log("Ville trouvé: " + mot);
			}
		});

	}

	return foundCities;
}
