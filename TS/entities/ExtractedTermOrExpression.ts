import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { CurriculumVitae } from "./CurriculumVitae";

@Entity()
export class ExtractedTermOrExpression {
  @PrimaryGeneratedColumn()
  extracted_term_or_expression_identity!: number;

  @Column()
  extracted_term_or_expression!: string;

  @Column()
  is_term!: boolean;

  @Column("time")
  from!: string;

  @Column("time")
  to!: string;

  @ManyToOne(() => CurriculumVitae, (cv) => cv.terms)
  @JoinColumn({ name: "curriculum_vitae_identity" })
  curriculum_vitae!: CurriculumVitae;
}
