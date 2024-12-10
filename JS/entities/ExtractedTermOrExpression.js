"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractedTermOrExpression = void 0;
const typeorm_1 = require("typeorm");
const CurriculumVitae_1 = require("./CurriculumVitae");
let ExtractedTermOrExpression = class ExtractedTermOrExpression {
};
exports.ExtractedTermOrExpression = ExtractedTermOrExpression;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ExtractedTermOrExpression.prototype, "extracted_term_or_expression_identity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ExtractedTermOrExpression.prototype, "extracted_term_or_expression", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], ExtractedTermOrExpression.prototype, "is_term", void 0);
__decorate([
    (0, typeorm_1.Column)("time"),
    __metadata("design:type", String)
], ExtractedTermOrExpression.prototype, "from", void 0);
__decorate([
    (0, typeorm_1.Column)("time"),
    __metadata("design:type", String)
], ExtractedTermOrExpression.prototype, "to", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CurriculumVitae_1.CurriculumVitae, (cv) => cv.terms),
    (0, typeorm_1.JoinColumn)({ name: "curriculum_vitae_identity" }),
    __metadata("design:type", CurriculumVitae_1.CurriculumVitae)
], ExtractedTermOrExpression.prototype, "curriculum_vitae", void 0);
exports.ExtractedTermOrExpression = ExtractedTermOrExpression = __decorate([
    (0, typeorm_1.Entity)()
], ExtractedTermOrExpression);
//# sourceMappingURL=ExtractedTermOrExpression.js.map