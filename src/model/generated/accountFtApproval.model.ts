import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {FtApproval} from "./ftApproval.model"
import {Account} from "./account.model"
import {TransferDirection} from "./_transferDirection"

@Entity_()
export class AccountFtApproval {
  constructor(props?: Partial<AccountFtApproval>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_()
  @ManyToOne_(() => FtApproval, {nullable: true})
  approval!: FtApproval | undefined | null

  @Index_()
  @ManyToOne_(() => Account, {nullable: false})
  account!: Account

  @Column_("varchar", {length: 4, nullable: true})
  direction!: TransferDirection | undefined | null
}
