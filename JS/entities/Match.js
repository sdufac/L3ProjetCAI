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
exports.Match = void 0;
const typeorm_1 = require("typeorm");
const ExtractedTermOrExpression_1 = require("./ExtractedTermOrExpression");
let Match = class Match {
};
exports.Match = Match;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Match.prototype, "match_identity", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ExtractedTermOrExpression_1.ExtractedTermOrExpression),
    (0, typeorm_1.JoinColumn)({ name: "extracted_term_or_expression_identity" }),
    __metadata("design:type", ExtractedTermOrExpression_1.ExtractedTermOrExpression)
], Match.prototype, "extracted_term_or_expression", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Match.prototype, "skill_or_job", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Match.prototype, "is_skill", void 0);
exports.Match = Match = __decorate([
    (0, typeorm_1.Entity)()
], Match);
//# sourceMappingURL=Match.js.map