import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {FToken} from "./fToken.model"
import {Account} from "./account.model"
import {TransferType} from "./_transferType"

@Entity_()
export class FtTransfer {
  constructor(props?: Partial<FtTransfer>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_()
  @ManyToOne_(() => FToken, {nullable: true})
  token!: FToken

  @Index_()
  @ManyToOne_(() => Account, {nullable: true})
  from!: Account | undefined | null

  @Index_()
  @ManyToOne_(() => Account, {nullable: true})
  to!: Account | undefined | null

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
  amount!: bigint | undefined | null

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  timestamp!: bigint

  @Column_("int4", {nullable: false})
  block!: number

  @Column_("text", {nullable: false})
  transactionHash!: string

  @Column_("varchar", {length: 8, nullable: true})
  transferType!: TransferType | undefined | null
}
