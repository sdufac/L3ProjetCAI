import * as DeepSpeech from "deepspeech";
import * as path from "path";

const MODEL_PATH = path.join(__dirname, "dsModel", "deepspeech-0.9.3-models.pbmm");
const SCORER_PATH = path.join(__dirname, "dsModel", "deepspeech-0.9.3-models.scorer");

const model = new DeepSpeech.Model(MODEL_PATH);
model.enableExternalScorer(SCORER_PATH);

async function transcribeAudio(audioBlob: Blob) {
}
