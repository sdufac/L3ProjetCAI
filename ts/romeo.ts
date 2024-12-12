export async function sendToRomeo(text: string) {
	const apiUrl = 'https://api.francetravail.io/partenaire/romeo/v2/competence';
	const token = 'e22fc70e2f278d63f4d0e535591e264a8e90434a0e2e47fcb0a17d0dad92baa3';

	const response = await fetch(apiUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Bearer ${token}',
		},
		body: JSON.stringify({ text }),
	});

	if (!response.ok) {
		throw new Error('Erreur lors de l\'envoi à l\'api : ${response.statusText}');
	}

	const result = await response.json();
	console.log("Compétences identifié :", result);
}
