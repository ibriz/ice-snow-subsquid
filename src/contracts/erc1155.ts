import { Ctx } from "../processor";
import { Contract as Erc1155Contract } from "../abi/erc1155";

export function getContractErc1155({
    ctx,
    contractAddress,
    blockHeight,
}: {
    ctx: Ctx;
    contractAddress: string;
    blockHeight: number;
}): Erc1155Contract {
    return new Erc1155Contract(
        { _chain: ctx._chain, block: { height: blockHeight } },
        contractAddress
    );
}
