import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, OneToMany as OneToMany_} from "typeorm"
import {FtTransfer} from "./ftTransfer.model"

@Entity_()
export class FToken {
  constructor(props?: Partial<FToken>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_()
  @Column_("text", {nullable: true})
  name!: string | undefined | null

  @Index_()
  @Column_("text", {nullable: true})
  symbol!: string | undefined | null

  @Column_("int4", {nullable: true})
  decimals!: number | undefined | null

  @OneToMany_(() => FtTransfer, e => e.token)
  transfers!: FtTransfer[]
}
