import { Ctx } from "../processor";
import { Contract as Erc20Contract } from "../abi/erc20";

export function getContractErc20({
    ctx,
    contractAddress,
    blockHeight,
}: {
    ctx: Ctx;
    contractAddress: string;
    blockHeight: number;
}): Erc20Contract {
    return new Erc20Contract(
        { _chain: ctx._chain, block: { height: blockHeight } },
        contractAddress
    );
}
