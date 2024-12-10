"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveToDatabase = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const CurriculumVitae_1 = require("../entities/CurriculumVitae");
const ExtractedTermOrExpression_1 = require("../entities/ExtractedTermOrExpression");
const Match_1 = require("../entities/Match");
const saveToDatabase = async () => {
    const connection = await (0, typeorm_1.createConnection)();
    const cvRepository = connection.getRepository(CurriculumVitae_1.CurriculumVitae);
    const termRepository = connection.getRepository(ExtractedTermOrExpression_1.ExtractedTermOrExpression);
    const matchRepository = connection.getRepository(Match_1.Match);
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
    const term = termRepository.create({
        extracted_term_or_expression: "Développeur",
        is_term: true,
        from: "00:01:00",
        to: "00:01:10",
        curriculum_vitae: savedCv,
    });
    const savedTerm = await termRepository.save(term);
    console.log("Terme extrait enregistré :", savedTerm);
    const match = matchRepository.create({
        extracted_term_or_expression: savedTerm,
        skill_or_job: "Développeur logiciel",
        is_skill: true,
    });
    const savedMatch = await matchRepository.save(match);
    console.log("Correspondance enregistrée :", savedMatch);
    await connection.close();
};
exports.saveToDatabase = saveToDatabase;
if (require.main === module) {
    (0, exports.saveToDatabase)().catch((error) => console.error(error));
}
//# sourceMappingURL=saveToDatabase.js.map