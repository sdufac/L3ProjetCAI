import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ExtractedTermOrExpression } from "./ExtractedTermOrExpression";

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  match_identity!: number;

  @ManyToOne(() => ExtractedTermOrExpression)
  @JoinColumn({ name: "extracted_term_or_expression_identity" })
  extracted_term_or_expression!: ExtractedTermOrExpression;

  @Column()
  skill_or_job!: string;

  @Column()
  is_skill!: boolean;
}
