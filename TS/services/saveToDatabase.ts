import "reflect-metadata";
import { createConnection } from "typeorm";
import { CurriculumVitae } from "../entities/CurriculumVitae";
import { ExtractedTermOrExpression } from "../entities/ExtractedTermOrExpression";
import { Match } from "../entities/Match";

export const saveToDatabase = async () => {
  const connection = await createConnection();

  const cvRepository = connection.getRepository(CurriculumVitae);
  const termRepository = connection.getRepository(ExtractedTermOrExpression);
  const matchRepository = connection.getRepository(Match);

  // Exemple de CV
  const cv = cvRepository.create({
    production_date: new Date(),
    production_place: "Paris",
    surname: "Doe",
    forname: "John",
    mobile_phone: "+33123456789",
    e_mail: "john.doe@example.com",
    audio: Buffer.from("audio file"),
    video: Buffer.from("video file"),
  });
  const savedCv = await cvRepository.save(cv);
  console.log("CV enregistré :", savedCv);

  // Exemple de terme extrait
  const term = termRepository.create({
    extracted_term_or_expression: "Développeur",
    is_term: true,
    from: "00:01:00",
    to: "00:01:10",
    curriculum_vitae: savedCv,
  });
  const savedTerm = await termRepository.save(term);
  console.log("Terme extrait enregistré :", savedTerm);

  // Exemple de match
  const match = matchRepository.create({
    extracted_term_or_expression: savedTerm,
    skill_or_job: "Développeur logiciel",
    is_skill: true,
  });
  const savedMatch = await matchRepository.save(match);
  console.log("Correspondance enregistrée :", savedMatch);

  await connection.close();
};

if (require.main === module) {
  saveToDatabase().catch((error) => console.error(error));
}
