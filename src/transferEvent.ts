import { SubstrateBlock, EvmLogEvent } from "@subsquid/substrate-processor";
import * as erc721 from "./abi/erc721";
import * as erc1155 from "./abi/erc1155";
import * as erc20 from "./abi/erc20";
import { ContractStandard, Account } from "./model";
import { Ctx } from "./processor";
import { EntityManager } from "./utils/entityManager";
import { BigNumber } from "ethers";
import { FTokenBalanceAction } from "./utils/utils";

export interface TransferEvent {
    id: string;
    from: string;
    to: string;
    token: string;
    timestamp: bigint;
    block: number;
    transactionHash: string;
    contractAddress: string;
    contractStandard: ContractStandard;
    amount: BigNumber;
}

export async function handleErc20Transfer(
    block: SubstrateBlock,
    event: EvmLogEvent
) {
    const {
        from,
        to,
        value: amount,
    } = erc20.events["Transfer(address,address,uint256)"].decode(event.args);

    // bind the incoming data into TransferEvent
    const transfer: TransferEvent = {
        id: event.id,
        token: event.args.address,
        from,
        to,
        timestamp: BigInt(block.timestamp),
        block: block.height,
        transactionHash: event.evmTxHash,
        contractAddress: event.args.address,
        amount,
        contractStandard: ContractStandard.ERC20,
    };

    return [transfer];
}

export async function handleErc721Transfer(
    block: SubstrateBlock,
    event: EvmLogEvent
) {
    const { from, to, tokenId } = erc721.events[
        "Transfer(address,address,uint256)"
    ].decode(event.args);

    // bind the incoming data into TransferEvent
    const transfer: TransferEvent = {
        id: event.id,
        token: tokenId.toString(),
        from,
        to,
        timestamp: BigInt(block.timestamp),
        block: block.height,
        transactionHash: event.evmTxHash,
        contractAddress: event.args.address,
        amount: BigNumber.from("1"),
        contractStandard: ContractStandard.ERC721,
    };

    return [transfer];
}

export async function handleErc1155TransferSingle(
    ctx: Ctx,
    block: SubstrateBlock,
    event: EvmLogEvent
) {
    const {
        operator,
        from,
        to,
        id: tokenId,
        value: amount,
    } = erc1155.events[
        "TransferSingle(address,address,address,uint256,uint256)"
    ].decode(event.args);

    // bind the incoming data into TransferEvent
    const transfer: TransferEvent = {
        id: event.id,
        token: tokenId.toString(),
        from,
        to,
        timestamp: BigInt(block.timestamp),
        block: block.height,
        transactionHash: event.evmTxHash,
        contractAddress: event.args.address,
        contractStandard: ContractStandard.ERC1155,
        amount: amount,
    };

    return [transfer];
}

export async function handleErc1155TransferBatch(
    ctx: Ctx,
    block: SubstrateBlock,
    event: EvmLogEvent
) {
    const { operator, from, to, ids, values } = erc1155.events[
        "TransferBatch(address,address,address,uint256[],uint256[])"
    ].decode(event.args);

    // bind the incoming data into TransferEvent
    const transferEvents: TransferEvent[] = [];
    for (let i = 0; i < ids.length; i++) {
        const transfer: TransferEvent = {
            id: event.id,
            token: ids[i].toString(),
            from,
            to,
            timestamp: BigInt(block.timestamp),
            block: block.height,
            transactionHash: event.evmTxHash,
            contractAddress: event.args.address,
            contractStandard: ContractStandard.ERC1155,
            amount: values[i],
        };
        transferEvents.push(transfer);
    }

    return transferEvents;
}

export async function saveTransfers(ctx: Ctx, transferEvents: TransferEvent[]) {
    const entityManager = new EntityManager(ctx);

    for (let transferEvent of transferEvents) {
        // save from account
        const fromAccount: Account = await entityManager.getOrCreateAccount(
            transferEvent.from
        );

        // save to account
        const toAccount: Account = await entityManager.getOrCreateAccount(
            transferEvent.to
        );

        // save contract
        const contract = await entityManager.getOrCreateContract({
            contractAddress: transferEvent.contractAddress,
            standard: transferEvent.contractStandard,
            createdAtBlock: BigInt(transferEvent.block),
            createdAt: transferEvent.timestamp,
        });

        if (
            transferEvent.contractStandard === ContractStandard.ERC721 ||
            transferEvent.contractStandard === ContractStandard.ERC1155
        ) {
            // save nftoken
            const token = await entityManager.getOrCreateNfToken(
                transferEvent,
                contract,
                toAccount
            );

            // save nftTransfer
            await entityManager.createNftTransfer(
                transferEvent,
                fromAccount,
                toAccount,
                token,
                transferEvent.amount,
                transferEvent.id
            );
        } else if (transferEvent.contractStandard === ContractStandard.ERC20) {
            // save ftoken
            const token = await entityManager.getOrCreateFToken(
                transferEvent,
                contract,
                toAccount
            );

            // save ftTransfer
            await entityManager.createFtTransfer(
                transferEvent,
                fromAccount,
                toAccount,
                token,
                transferEvent.amount,
                transferEvent.id
            );

            // save ft balance for from account
            await entityManager.getOrCreateFTokenBalance(
                fromAccount,
                token,
                transferEvent.contractAddress,
                transferEvent.block,
                transferEvent.timestamp,
                BigInt(transferEvent.amount.toString()),
                FTokenBalanceAction.SUB
            );

            // save ft balance for to account
            await entityManager.getOrCreateFTokenBalance(
                toAccount,
                token,
                transferEvent.contractAddress,
                transferEvent.block,
                transferEvent.timestamp,
                BigInt(transferEvent.amount.toString()),
                FTokenBalanceAction.ADD
            );
        }
    }

    // persist in db
    await ctx.store.save([...EntityManager.accounts.values()]);
    await ctx.store.save([...EntityManager.contracts.values()]);
    await ctx.store.save([...EntityManager.nfTokens.values()]);
    await ctx.store.save([...EntityManager.fTokens.values()]);
    await ctx.store.save([...EntityManager.nftTransfers.values()]);
    await ctx.store.save([...EntityManager.ftTransfers.values()]);
    await ctx.store.save([...EntityManager.ftBalances.values()]);
    await ctx.store.save([...EntityManager.accountNftTransfers]);
    await ctx.store.save([...EntityManager.accountftTransfers]);
}
