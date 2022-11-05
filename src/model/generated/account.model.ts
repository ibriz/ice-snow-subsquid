import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToMany as OneToMany_} from "typeorm"
import {NfToken} from "./nfToken.model"
import {AccountNftTransfer} from "./accountNftTransfer.model"
import {AccountFtTransfer} from "./accountFtTransfer.model"
import {AccountNftApproval} from "./accountNftApproval.model"
import {AccountFtApproval} from "./accountFtApproval.model"
import {AccountFTokenBalance} from "./accountFTokenBalance.model"

@Entity_()
export class Account {
  constructor(props?: Partial<Account>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @OneToMany_(() => NfToken, e => e.owner)
  ownedTokens!: NfToken[]

  @OneToMany_(() => AccountNftTransfer, e => e.account)
  nftTransfers!: AccountNftTransfer[]

  @OneToMany_(() => AccountFtTransfer, e => e.account)
  ftTransfers!: AccountFtTransfer[]

  @OneToMany_(() => AccountNftApproval, e => e.account)
  nftApprovals!: AccountNftApproval[]

  @OneToMany_(() => AccountFtApproval, e => e.account)
  ftApprovals!: AccountFtApproval[]

  @OneToMany_(() => AccountFTokenBalance, e => e.account)
  balancesFToken!: AccountFTokenBalance[]
}
