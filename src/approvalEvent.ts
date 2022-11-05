import { SubstrateBlock, EvmLogEvent } from "@subsquid/substrate-processor";
import { BigNumber } from "ethers";
import { Account, ContractStandard } from "./model";
import * as erc721 from "./abi/erc721";
import * as erc1155 from "./abi/erc1155";
import * as erc20 from "./abi/erc20";
import { Ctx } from "./processor";
import { EntityManager } from "./utils/entityManager";

export interface ApprovalEvent {
    id: string;
    from: string;
    to: string;
    token?: string;
    timestamp: bigint;
    block: number;
    transactionHash: string;
    contractAddress: string;
    contractStandard: ContractStandard;
    amount?: BigNumber;
    approveAll?: boolean;
}

export async function handleErc721Approval(
    block: SubstrateBlock,
    event: EvmLogEvent
): Promise<ApprovalEvent[]> {
    const { owner, approved, tokenId } = erc721.events[
        "Approval(address,address,uint256)"
    ].decode(event.args);

    const approval: ApprovalEvent = {
        id: event.id,
        token: tokenId.toString(),
        from: owner,
        to: approved,
        timestamp: BigInt(block.timestamp),
        block: block.height,
        transactionHash: event.evmTxHash,
        contractAddress: event.args.address,
        contractStandard: ContractStandard.ERC721,
    };

    return [approval];
}

export async function handleErc721ApprovalAll(
    block: SubstrateBlock,
    event: EvmLogEvent
): Promise<ApprovalEvent[]> {
    const { owner, operator, approved } = erc721.events[
        "ApprovalForAll(address,address,bool)"
    ].decode(event.args);

    const approval: ApprovalEvent = {
        id: event.id,
        from: owner,
        to: operator,
        timestamp: BigInt(block.timestamp),
        block: block.height,
        transactionHash: event.evmTxHash,
        contractAddress: event.args.address,
        contractStandard: ContractStandard.ERC721,
        approveAll: approved,
    };

    return [approval];
}

export async function handleErc1155ApprovalAll(
    block: SubstrateBlock,
    event: EvmLogEvent
): Promise<ApprovalEvent[]> {
    const { account, operator, approved } = erc1155.events[
        "ApprovalForAll(address,address,bool)"
    ].decode(event.args);

    const approval: ApprovalEvent = {
        id: event.id,
        from: account,
        to: operator,
        timestamp: BigInt(block.timestamp),
        block: block.height,
        transactionHash: event.evmTxHash,
        contractAddress: event.args.address,
        contractStandard: ContractStandard.ERC721,
        approveAll: approved,
    };

    return [approval];
}

export async function handleErc20Approval(
    block: SubstrateBlock,
    event: EvmLogEvent
): Promise<ApprovalEvent[]> {
    const { owner, spender, value } = erc20.events[
        "Approval(address,address,uint256)"
    ].decode(event.args);

    const approval: ApprovalEvent = {
        id: event.id,
        from: owner,
        to: spender,
        timestamp: BigInt(block.timestamp),
        block: block.height,
        transactionHash: event.evmTxHash,
        contractAddress: event.args.address,
        contractStandard: ContractStandard.ERC721,
        amount: value,
    };

    return [approval];
}

export async function saveApprovals(ctx: Ctx, approvalEvents: ApprovalEvent[]) {
    const entityManager = new EntityManager(ctx);

    for (let approvalEvent of approvalEvents) {
        // save from account
        const fromAccount: Account = await entityManager.getOrCreateAccount(
            approvalEvent.from
        );

        // save to account
        const toAccount: Account = await entityManager.getOrCreateAccount(
            approvalEvent.to
        );

        // save contract
        const contract = await entityManager.getOrCreateContract({
            contractAddress: approvalEvent.contractAddress,
            standard: approvalEvent.contractStandard,
            createdAtBlock: BigInt(approvalEvent.block),
            createdAt: approvalEvent.timestamp,
        });

        if (approvalEvent.contractStandard == ContractStandard.ERC721) {
            // save nftoken
            const token = await entityManager.getOrCreateNfToken(
                approvalEvent,
                contract,
                toAccount
            );

            // save nftApproval
            await entityManager.createNftApproval(
                approvalEvent,
                fromAccount,
                toAccount,
                token,
                approvalEvent.id
            );
        } else if (approvalEvent.contractStandard === ContractStandard.ERC20) {
            // save ftoken
            const token = await entityManager.getOrCreateFToken(
                approvalEvent,
                contract,
                toAccount
            );

            // save ftApproval
            await entityManager.createFtApproval(
                approvalEvent,
                fromAccount,
                toAccount,
                token,
                // @ts-ignore
                approvalEvent.amount,
                approvalEvent.id
            );
        }
    }

    // persist in db
    await ctx.store.save([...EntityManager.accounts.values()]);
    await ctx.store.save([...EntityManager.contracts.values()]);
    await ctx.store.save([...EntityManager.nfTokens.values()]);
    await ctx.store.save([...EntityManager.fTokens.values()]);
    await ctx.store.save([...EntityManager.nftApprovals.values()]);
    await ctx.store.save([...EntityManager.ftApproval.values()]);
    await ctx.store.save([...EntityManager.accountNftApprovals]);
    await ctx.store.save([...EntityManager.accountftApprovals]);
}
