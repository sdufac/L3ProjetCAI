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
exports.CurriculumVitae = void 0;
const typeorm_1 = require("typeorm");
const ExtractedTermOrExpression_1 = require("./ExtractedTermOrExpression");
let CurriculumVitae = class CurriculumVitae {
};
exports.CurriculumVitae = CurriculumVitae;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CurriculumVitae.prototype, "curriculum_vitae_identity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], CurriculumVitae.prototype, "production_date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CurriculumVitae.prototype, "production_place", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CurriculumVitae.prototype, "surname", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CurriculumVitae.prototype, "forname", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], CurriculumVitae.prototype, "birth_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CurriculumVitae.prototype, "identity_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CurriculumVitae.prototype, "checksum", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CurriculumVitae.prototype, "mobile_phone", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CurriculumVitae.prototype, "e_mail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "blob" }),
    __metadata("design:type", Buffer)
], CurriculumVitae.prototype, "audio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "blob" }),
    __metadata("design:type", Buffer)
], CurriculumVitae.prototype, "video", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ExtractedTermOrExpression_1.ExtractedTermOrExpression, (term) => term.curriculum_vitae),
    __metadata("design:type", Array)
], CurriculumVitae.prototype, "terms", void 0);
exports.CurriculumVitae = CurriculumVitae = __decorate([
    (0, typeorm_1.Entity)()
], CurriculumVitae);
//# sourceMappingURL=CurriculumVitae.js.map