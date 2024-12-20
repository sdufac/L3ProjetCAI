import { Competence } from './romeo.js'
import sqlite3 from "sqlite3";
import path from 'path';
import { __dirname, __filename } from "./server.js"

export function sendToBdd(videoName: string, dbPath: string): Promise<number> {
	return new Promise((resolve, reject) => {
		console.log("Chemin de la bdd utilisé: " + dbPath);
		const db = new sqlite3.Database(dbPath);

		const query = `INSERT INTO video (nom) VALUES (?)`;
		db.run(query, [videoName], function(err) {
			if (err) {
				console.log("Erreur lors de l'insertion dans la table video: " + err.message);
				reject(err);
			} else {
				resolve(this.lastID);
			}
		});

		db.close();
	});
}

export function insertCompetence(dbPath: string, intitule: string, codeRome: string, videoId: number): Promise<void> {
	return new Promise((resolve, reject) => {
		const db = new sqlite3.Database(dbPath);
		const query = `INSERT INTO competence (intitule,codeRome,video_id) VALUES (?,?,?)`;

		db.run(query, [intitule, codeRome, videoId], (err) => {
			if (err) {
				console.log("Erreur lors de l'insertion dans la table compétence: " + err.message);
				reject(err);
			} else {
				resolve();
			}
		});

		db.close();
	});
}

export function createTable(dbPath: string): Promise<void> {
	const createTables = `
	    CREATE TABLE IF NOT EXISTS video (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		nom TEXT NOT NULL,
		date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	    );

	    CREATE TABLE IF NOT EXISTS competence (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		intitule TEXT NOT NULL,
		codeRome TEXT NOT NULL,
		video_id INTEGER NOT NULL,
		FOREIGN KEY (video_id) REFERENCES video (id)
		    ON DELETE CASCADE
		    ON UPDATE CASCADE
	    );
	`;

	return new Promise((resolve, reject) => {
		const db = new sqlite3.Database(dbPath);

		db.exec(createTables, (err) => {
			if (err) {
				reject(err);
			} else {
				console.log('Tables crées ou deja présente');
				resolve();
			}
		});

		db.close();
	});
}
