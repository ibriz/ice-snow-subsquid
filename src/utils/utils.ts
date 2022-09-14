import { ContractStandard, TransferType } from "../model";
import { BigNumber } from "ethers";
import { Ctx } from "../processor";
import * as contracts from "../contracts";
import { addTimeout } from "@subsquid/util-timeout";
import assert from "assert";

export enum FTokenBalanceAction {
    ADD = "ADD",
    SUB = "SUB",
}

export const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";

export function getTokenId(address: string, tokenId?: string): string {
    return `${address.substring(0, 6)}-${address.substring(
        address.length - 6,
        address.length
    )}${tokenId ? `-${tokenId}` : ""}`;
}

export function isMint(from: string, to: string): boolean {
    return from === EMPTY_ADDRESS && to !== EMPTY_ADDRESS;
}

export function isBurn(from: string, to: string): boolean {
    return to === EMPTY_ADDRESS && from !== EMPTY_ADDRESS;
}

export function getTransferType(from: string, to: string): TransferType {
    if (isMint(from, to)) {
        return TransferType.MINT;
    }
    if (isBurn(from, to)) {
        return TransferType.BURN;
    }

    return TransferType.TRANSFER;
}

export function getTokenTotalSupply(
    currentAmount: bigint,
    newAmount: bigint,
    txType: TransferType
): bigint {
    let newValue = currentAmount;

    switch (txType) {
        case TransferType.MINT:
            newValue = BigInt(
                BigNumber.from(currentAmount)
                    .add(BigNumber.from(newAmount))
                    .toString()
            );
            break;
        case TransferType.BURN:
            newValue = BigInt(
                BigNumber.from(currentAmount)
                    .sub(BigNumber.from(newAmount))
                    .toString()
            );
            break;
        case TransferType.TRANSFER:
            /**
             * In case squid missed MINT event for particular token, we use fists occurred TRANSFER amount for initialization
             * of token total supply. It's more workaround cases when squid is starting not from first block.
             */
            if (currentAmount === BigInt(0)) {
                newValue = newAmount;
            }
            break;
        default:
    }

    return newValue >= BigInt(0) ? newValue : BigInt(0);
}

export async function getTokenBalanceOf({
    tokenId,
    accountAddress,
    contractAddress,
    contractStandard,
    blockHeight,
    ctx,
}: {
    tokenId?: BigNumber;
    accountAddress: string;
    contractAddress: string;
    contractStandard: ContractStandard;
    blockHeight: number;
    ctx: Ctx;
}): Promise<bigint> {
    let contractInst = null;
    let balance = null;

    switch (contractStandard) {
        case ContractStandard.ERC20:
            contractInst = contracts.getContractErc20({
                ctx,
                contractAddress,
                blockHeight,
            });
            balance = await addTimeout(
                contractInst.balanceOf(accountAddress),
                10
            );
            break;
        case ContractStandard.ERC721:
            contractInst = contracts.getContractErc721({
                ctx,
                contractAddress,
                blockHeight,
            });
            balance = await addTimeout(
                contractInst.balanceOf(accountAddress),
                10
            );
            break;
        case ContractStandard.ERC1155:
            contractInst = contracts.getContractErc1155({
                ctx,
                contractAddress,
                blockHeight,
            });
            balance = tokenId
                ? await addTimeout(
                      contractInst.balanceOf(accountAddress, tokenId),
                      10
                  )
                : null;
            break;
        default:
    }

    assert(balance, "balance is not available");

    return BigInt(balance.toString());
}
