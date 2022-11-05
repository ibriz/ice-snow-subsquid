import { BigNumber } from "ethers";
import { ApprovalEvent } from "../approvalEvent";
import {
    Contract,
    ContractStandard,
    NfToken,
    Account,
    NftTransfer,
    FToken,
    FtTransfer,
    AccountNftTransfer,
    AccountFtTransfer,
    TransferDirection,
    AccountFTokenBalance,
    NftApproval,
    FtApproval,
    AccountNftApproval,
    AccountFtApproval,
} from "../model";
import { Ctx } from "../processor";
import { TransferEvent } from "../transferEvent";
import { getTokenDetails, TokenDetails } from "./tokenDetails";
import {
    FTokenBalanceAction,
    getTokenBalanceOf,
    getTokenId,
    getTokenTotalSupply,
    getTransferType,
} from "./utils";

export class EntityManager {
    public static accounts: Map<string, Account> = new Map();
    public static contracts: Map<string, Contract> = new Map();
    public static nfTokens: Map<string, NfToken> = new Map();
    public static fTokens: Map<string, FToken> = new Map();
    public static nftTransfers: Map<string, NftTransfer> = new Map();
    public static ftTransfers: Map<string, FtTransfer> = new Map();
    public static accountNftTransfers: Set<AccountNftTransfer> = new Set();
    public static accountftTransfers: Set<AccountFtTransfer> = new Set();
    public static ftBalances: Map<string, AccountFTokenBalance> = new Map();
    public static nftApprovals: Map<string, NftApproval> = new Map();
    public static ftApproval: Map<string, FtApproval> = new Map();
    public static accountNftApprovals: Set<AccountNftApproval> = new Set();
    public static accountftApprovals: Set<AccountFtApproval> = new Set();

    private ctx: Ctx;

    constructor(context: Ctx) {
        this.ctx = context;
    }

    getOrCreateAccount = async (address: string): Promise<Account> => {
        let owner = EntityManager.accounts.get(address);
        if (!owner) {
            owner = await this.ctx.store.get(Account, address);
            if (owner) {
                EntityManager.accounts.set(address, owner);
            }
        }

        if (!owner) {
            console.log(`creating owner ${address}`);
            owner = new Account({ id: address });
            EntityManager.accounts.set(address, owner);
        }

        return owner;
    };

    getOrCreateContract = async ({
        contractAddress,
        standard,
        createdAtBlock,
        createdAt,
    }: {
        contractAddress: string;
        standard: ContractStandard;
        createdAtBlock: bigint;
        createdAt: bigint;
    }): Promise<Contract> => {
        let contract = EntityManager.contracts.get(contractAddress);
        if (!contract) {
            contract = await this.ctx.store.get(Contract, contractAddress);
            if (contract) {
                EntityManager.contracts.set(contractAddress, contract);
            }
        }

        if (!contract) {
            console.log(`creating contract ${contractAddress}`);
            contract = new Contract({
                id: contractAddress,
                contractStandard: standard,
                createdAtBlock,
                createdAt,
            });
            EntityManager.contracts.set(contractAddress, contract);
        }

        return contract;
    };

    getOrCreateNfToken = async (
        transferData: TransferEvent | ApprovalEvent,
        contract: Contract,
        owner: Account,
        isTransfer: Boolean = true
    ): Promise<NfToken> => {
        const tokenId = getTokenId(
            transferData.contractAddress,
            transferData.token
        );
        let token = EntityManager.nfTokens.get(tokenId);
        if (!token) {
            token = await this.ctx.store.get(NfToken, tokenId);
            if (token) {
                EntityManager.nfTokens.set(tokenId, token);
            }
        }

        if (!token) {
            console.log(`creating token ${tokenId}`);
            // get token details
            const tokenDetails: TokenDetails = await getTokenDetails({
                tokenId: BigNumber.from(transferData.token),
                contractAddress: transferData.contractAddress,
                contractStandard: transferData.contractStandard,
                ctx: this.ctx,
                blockHeight: transferData.block,
            });
            console.log(`tokenDetails: ${JSON.stringify(tokenDetails)}`);
            token = new NfToken({
                id: tokenId,
                owner,
                name: tokenDetails.name,
                symbol: tokenDetails.symbol,
                uri: tokenDetails.uri,
                contract,
                amount: BigInt(0),
            });
        }

        if (isTransfer && transferData.amount) {
            const transferType = getTransferType(
                transferData.from,
                transferData.to
            );
            token.owner = owner;
            token.amount = getTokenTotalSupply(
                token.amount,
                BigInt(transferData.amount.toString()),
                transferType
            );
        }
        EntityManager.nfTokens.set(tokenId, token);
        return token;
    };

    createNftTransfer = async (
        transferData: TransferEvent,
        from: Account,
        to: Account,
        token: NfToken,
        amount: BigNumber,
        eventId: string
    ): Promise<NftTransfer> => {
        const transferId = `${eventId}-${transferData.token}`;

        let transfer = EntityManager.nftTransfers.get(transferId);
        if (!transfer) {
            transfer = await this.ctx.store.get(NftTransfer, transferId);
            if (transfer) {
                EntityManager.nftTransfers.set(transferId, transfer);
            }
        }

        if (!transfer) {
            console.log(`creating NFT transfer ${transferId}`);
            const transferType = getTransferType(
                transferData.from,
                transferData.to
            );

            transfer = new NftTransfer({
                id: transferId,
                token,
                from,
                to,
                amount: BigInt(amount.toString()),
                timestamp: transferData.timestamp,
                block: transferData.block,
                transactionHash: transferData.transactionHash,
                transferType,
            });
            EntityManager.nftTransfers.set(transferId, transfer);

            // save accountstransfer to link transfer and account
            const accountTransferFrom = new AccountNftTransfer({
                id: `${transferId}-${from.id}-${TransferDirection.From}`,
                transfer,
                account: from,
                direction: TransferDirection.From,
            });
            EntityManager.accountNftTransfers.add(accountTransferFrom);

            const accountTransferTo = new AccountNftTransfer({
                id: `${transferId}-${to.id}-${TransferDirection.To}`,
                transfer,
                account: to,
                direction: TransferDirection.To,
            });
            EntityManager.accountNftTransfers.add(accountTransferTo);
        }
        return transfer;
    };

    getOrCreateFToken = async (
        transferData: TransferEvent | ApprovalEvent,
        contract: Contract,
        owner: Account
    ): Promise<FToken> => {
        const tokenId = transferData.contractAddress;
        let token = EntityManager.fTokens.get(tokenId);
        if (!token) {
            token = await this.ctx.store.get(FToken, tokenId);
            if (token) {
                EntityManager.fTokens.set(tokenId, token);
            }
        }

        if (!token) {
            console.log(`creating token ${tokenId}`);
            const tokenDetails: TokenDetails = await getTokenDetails({
                tokenId: BigNumber.from(transferData.token),
                contractAddress: transferData.contractAddress,
                contractStandard: transferData.contractStandard,
                ctx: this.ctx,
                blockHeight: transferData.block,
            });
            console.log(`tokenDetails: ${JSON.stringify(tokenDetails)}`);
            token = new FToken({
                id: tokenId,
                name: tokenDetails.name,
                symbol: tokenDetails.symbol,
                decimals: tokenDetails.decimals,
            });
            EntityManager.fTokens.set(tokenId, token);
        }
        return token;
    };

    createFtTransfer = async (
        transferData: TransferEvent,
        from: Account,
        to: Account,
        token: FToken,
        amount: BigNumber,
        eventId: string
    ): Promise<FtTransfer> => {
        const transferId = eventId;

        let transfer = EntityManager.ftTransfers.get(transferId);
        if (!transfer) {
            transfer = await this.ctx.store.get(FtTransfer, transferId);
            if (transfer) {
                EntityManager.ftTransfers.set(transferId, transfer);
            }
        }

        if (!transfer) {
            console.log(`creating FT transfer ${transferId}`);
            const transferType = getTransferType(
                transferData.from,
                transferData.to
            );

            transfer = new FtTransfer({
                id: transferId,
                token,
                from,
                to,
                amount: BigInt(amount.toString()),
                timestamp: transferData.timestamp,
                block: transferData.block,
                transactionHash: transferData.transactionHash,
                transferType,
            });
            EntityManager.ftTransfers.set(transferId, transfer);

            // save accountstransfer to link transfer and account
            const accountTransferFrom = new AccountFtTransfer({
                id: `${transferId}-${from.id}-${TransferDirection.From}`,
                transfer,
                account: from,
                direction: TransferDirection.From,
            });
            EntityManager.accountftTransfers.add(accountTransferFrom);

            const accountTransferTo = new AccountFtTransfer({
                id: `${transferId}-${to.id}${TransferDirection.To}`,
                transfer,
                account: to,
                direction: TransferDirection.To,
            });
            EntityManager.accountftTransfers.add(accountTransferTo);
        }
        return transfer;
    };

    getOrCreateFTokenBalance = async (
        account: Account,
        token: FToken,
        contractAddress: string,
        blockHeight: number,
        timestamp: bigint,
        amount: bigint,
        action: FTokenBalanceAction
    ) => {
        const balanceId = `${account.id}-${token.id}`;
        let accountBalance = EntityManager.ftBalances.get(balanceId);
        if (!accountBalance) {
            accountBalance = await this.ctx.store.get(
                AccountFTokenBalance,
                balanceId
            );
            if (accountBalance) {
                EntityManager.ftBalances.set(balanceId, accountBalance);
            }
        }

        if (!accountBalance) {
            console.log(`creating ft account balance: ${balanceId}`);
            accountBalance = new AccountFTokenBalance({
                id: balanceId,
                account,
                token,
                amount: await getTokenBalanceOf({
                    accountAddress: account.id,
                    contractAddress,
                    contractStandard: ContractStandard.ERC20,
                    ctx: this.ctx,
                    blockHeight,
                }),
                updatedAtBlock: blockHeight,
                updatedAt: timestamp,
            });
        } else {
            switch (action) {
                case FTokenBalanceAction.ADD:
                    accountBalance.amount += amount;
                    break;
                case FTokenBalanceAction.SUB:
                    accountBalance.amount -= amount;
                    break;
                default:
            }
        }
        EntityManager.ftBalances.set(balanceId, accountBalance);
        return accountBalance;
    };

    createNftApproval = async (
        approvalData: ApprovalEvent,
        from: Account,
        to: Account,
        token: NfToken,
        eventId: string
    ): Promise<NftApproval> => {
        const approvalId = `${eventId}-${approvalData.token}`;

        let approval = EntityManager.nftApprovals.get(approvalId);
        if (!approval) {
            approval = await this.ctx.store.get(NftApproval, approvalId);
            if (approval) {
                EntityManager.nftApprovals.set(approvalId, approval);
            }
        }

        if (!approval) {
            console.log(`creating NFT approval ${approvalId}`);

            approval = new NftApproval({
                id: approvalId,
                from,
                to,
                token,
                timestamp: approvalData.timestamp,
                block: approvalData.block,
                transactionHash: approvalData.transactionHash,
            });
            EntityManager.nftApprovals.set(approvalId, approval);

            const accountApprovalFrom = new AccountNftApproval({
                id: `${approvalId}-${from.id}-${TransferDirection.From}`,
                approval,
                account: from,
                direction: TransferDirection.From,
            });
            EntityManager.accountNftApprovals.add(accountApprovalFrom);

            const accountApprovalTo = new AccountNftApproval({
                id: `${approvalId}-${to.id}-${TransferDirection.To}`,
                approval,
                account: to,
                direction: TransferDirection.To,
            });
            EntityManager.accountNftApprovals.add(accountApprovalTo);
        }

        return approval;
    };

    createFtApproval = async (
        approvalData: ApprovalEvent,
        from: Account,
        to: Account,
        token: FToken,
        amount: BigNumber,
        eventId: string
    ): Promise<FtApproval> => {
        const approvalId = eventId;

        let approval = EntityManager.ftApproval.get(approvalId);
        if (!approval) {
            approval = await this.ctx.store.get(FtApproval, approvalId);
            if (approval) {
                EntityManager.ftApproval.set(approvalId, approval);
            }
        }

        if (!approval) {
            console.log(`creating FT approval ${approvalId}`);

            approval = new FtApproval({
                id: approvalId,
                from,
                to,
                token,
                amount: BigInt(amount.toString()),
                timestamp: approvalData.timestamp,
                block: approvalData.block,
                transactionHash: approvalData.transactionHash,
            });
            EntityManager.ftApproval.set(approvalId, approval);

            const accountApprovalFrom = new AccountFtApproval({
                id: `${approvalId}-${from.id}-${TransferDirection.From}`,
                approval,
                account: from,
                direction: TransferDirection.From,
            });
            EntityManager.accountftApprovals.add(accountApprovalFrom);

            const accountApprovalTo = new AccountFtApproval({
                id: `${approvalId}-${to.id}-${TransferDirection.To}`,
                approval,
                account: to,
                direction: TransferDirection.To,
            });
            EntityManager.accountftApprovals.add(accountApprovalTo);
        }

        return Promise.resolve(new FtApproval());
    };
}
