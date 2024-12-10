import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ExtractedTermOrExpression } from "./ExtractedTermOrExpression";

@Entity()
export class CurriculumVitae {
  @PrimaryGeneratedColumn()
  curriculum_vitae_identity!: number;

  @Column()
  production_date!: Date;

  @Column()
  production_place!: string;

  @Column()
  surname!: string;

  @Column()
  forname!: string;

  @Column({ nullable: true })
  birth_date?: Date;

  @Column({ nullable: true })
  identity_number?: string;

  @Column({ nullable: true })
  checksum?: string;

  @Column()
  mobile_phone!: string;

  @Column()
  e_mail!: string;

  @Column({ type: "blob" })
  audio!: Buffer;

  @Column({ type: "blob" })
  video!: Buffer;

  @OneToMany(() => ExtractedTermOrExpression, (term) => term.curriculum_vitae)
  terms!: ExtractedTermOrExpression[];
}
