import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, OneToMany as OneToMany_} from "typeorm"
import * as marshal from "./marshal"
import {Account} from "./account.model"
import {NftTransfer} from "./nftTransfer.model"
import {Contract} from "./contract.model"

@Entity_()
export class NfToken {
  constructor(props?: Partial<NfToken>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_()
  @ManyToOne_(() => Account, {nullable: true})
  owner!: Account | undefined | null

  @Column_("text", {nullable: true})
  name!: string | undefined | null

  @Column_("text", {nullable: true})
  symbol!: string | undefined | null

  @Column_("text", {nullable: true})
  uri!: string | undefined | null

  @OneToMany_(() => NftTransfer, e => e.token)
  transfers!: NftTransfer[]

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  amount!: bigint

  @Index_()
  @ManyToOne_(() => Contract, {nullable: true})
  contract!: Contract | undefined | null
}
