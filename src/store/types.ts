import * as BlockTypes from './block/types';
import * as ContractTypes from './contract/types';
import * as EventTypes from './event/types';
import * as TransactionTypes from './transaction/types';
import * as DrizzleTypes from './drizzle/types';
import * as ProtocolTypes from './protocol/types';
import * as FeedTypes from './feed/types';
import * as NodeTypes from './node/types';

export interface Point {
    x: number,
    y: number
}

export {
    NodeTypes,
    FeedTypes,
    ProtocolTypes,
    BlockTypes,
    ContractTypes,
    EventTypes,
    TransactionTypes,
    DrizzleTypes
}