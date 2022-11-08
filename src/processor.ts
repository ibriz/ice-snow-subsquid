import {
    BatchContext,
    BatchProcessorItem,
    SubstrateBatchProcessor,
} from "@subsquid/substrate-processor";
import { Store, TypeormDatabase } from "@subsquid/typeorm-store";
import * as erc721 from "./abi/erc721";
import * as erc1155 from "./abi/erc1155";
import * as erc20 from "./abi/erc20";
import {
    handleErc721Transfer,
    handleErc1155TransferSingle,
    TransferEvent,
    saveTransfers,
    handleErc20Transfer,
    handleErc1155TransferBatch,
} from "./transferEvent";


const archiveHost = process.env.ARCHIVE_HOST || "localhost";
const archivePort = process.env.ARCHIVE_PORT
    ? parseInt(process.env.ARCHIVE_PORT)
    : 8888;

const processor = new SubstrateBatchProcessor()
    .setBatchSize(10)
    .setDataSource({
        chain: "wss://snow-archive.icenetwork.io",
        archive: `http://${archiveHost}:${archivePort}/graphql`,
    })
    .addEvmLog("*", {
        filter: [
            [
                erc20.events["Transfer(address,address,uint256)"].topic,
                erc721.events["Transfer(address,address,uint256)"].topic,
                erc1155.events[
                    "TransferSingle(address,address,address,uint256,uint256)"
                ].topic,
                erc1155.events[
                    "TransferBatch(address,address,address,uint256[],uint256[])"
                ].topic,
            ],
        ],
    });

type Item = BatchProcessorItem<typeof processor>;
export type Ctx = BatchContext<Store, Item>;

processor.run(new TypeormDatabase(), async ctx => {
    const transfersData: TransferEvent[] = [];
    for (let block of ctx.blocks) {
        for (let item of block.items) {
            if (item.name == "EVM.Log") {
                switch (item.event.args.topics[0]) {
                    case erc20.events["Transfer(address,address,uint256)"]
                        .topic:
                    case erc721.events["Transfer(address,address,uint256)"]
                        .topic:
                        try {
                            const transfers = await handleErc20Transfer(
                                block.header,
                                item.event
                            );
                            transfersData.push(...transfers);
                        } catch (error) {
                            try {
                                const transfers = await handleErc721Transfer(
                                    block.header,
                                    item.event
                                );
                                transfersData.push(...transfers);
                            } catch (error) {}
                        }
                        break;
                    case erc1155.events[
                        "TransferSingle(address,address,address,uint256,uint256)"
                    ].topic:
                        const transfers = await handleErc1155TransferSingle(
                            ctx,
                            block.header,
                            item.event
                        );
                        transfersData.push(...transfers);
                        break;
                    case erc1155.events[
                        "TransferBatch(address,address,address,uint256[],uint256[])"
                    ].topic:
                        const transfersBatch = await handleErc1155TransferBatch(
                            ctx,
                            block.header,
                            item.event
                        );
                        transfersData.push(...transfersBatch);
                        break;
                    
                    default:
                }
            }
        }
    }
    await saveTransfers(ctx, transfersData);
});
