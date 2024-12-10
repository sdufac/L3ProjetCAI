import { DataSource } from "typeorm";
import * as path from "path";
import * as fs from "fs";

// Résolution du chemin absolu pour ormconfig.json
const ormconfigPath = path.resolve(__dirname, "../ormconfig.json");
const ormconfig = JSON.parse(fs.readFileSync(ormconfigPath, "utf-8"));

(async () => {
  try {
    const AppDataSource = new DataSource(ormconfig);

    await AppDataSource.initialize();
    console.log("Connexion à la base de données réussie !");
  } catch (error) {
    console.error("Erreur lors de la connexion à la base de données :", error);
  }
})();
