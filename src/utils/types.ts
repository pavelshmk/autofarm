import { JsonProperty, Serializable } from "typescript-json-serializer";
import { DateTime } from "luxon";
import BN from "bignumber.js";
import { toBNJS } from "./utilities";

const DATETIME_PROPERTY = { onDeserialize: (val: string) => DateTime.fromISO(val) }
const DECIMAL_PROPERTY = { onDeserialize: (val: string) => parseFloat(val) }
const DECIMAL_BN_PROPERTY = { onDeserialize: (val: string) => toBNJS(val) }

@Serializable()
export class APIResponseGeneral {
    @JsonProperty() totalTvl: number;
}

@Serializable()
export class Supplier {
    @JsonProperty() name: string;
    @JsonProperty() multiplier: number;
}

@Serializable()
export class Pool {
    @JsonProperty() id: number;
    @JsonProperty() title: string;
    @JsonProperty() supplier: string;
    @JsonProperty() victimPoolId: number;
    @JsonProperty() rewardTokenAddress: string;
    @JsonProperty() lpTokenAddress: string;
    @JsonProperty() lpTokenName: string;
    @JsonProperty() tokenSymbol: string;
    @JsonProperty() lpTokenPriceInWeth: number;
    @JsonProperty() lpTokenPriceInUsd: number;
    @JsonProperty() lpFeesApy: number;
    @JsonProperty() apy: number;
    @JsonProperty() tvl: number;
    @JsonProperty() drainReward: number;
    @JsonProperty() drainBalance: number;
    @JsonProperty() victimApy: number;
    @JsonProperty() victimTvl: number;
    @JsonProperty() extraApy: number;
}

@Serializable()
export class APIResponse {
    @JsonProperty({ type: APIResponseGeneral }) general: APIResponseGeneral;
    @JsonProperty({ type: Supplier }) suppliers: Supplier[];
    @JsonProperty({ type: Pool }) pools: Pool[];
}

export interface JsonPool {
    // token: string;
    tokenPrefix: string;
    victimPID: number;
    lp: string;
    pid: number;
    icon1: string;
    icon2?: string;
    token1: string;
    token2?: string;
    target: string;
    migrate?: { abi: string, address: string };
    adapter: string;
}

export type TableRow = JsonPool & {
    lpEarned?: BN
    lpStaked?: BN
    apyValue: number
    tvlValue: number
    victimTvlValue: number
    info?: Pool
};
export type OtherTableRow = { pool: Pool, jsonPool: JsonPool, amount: BN, usdAmount: BN }

@Serializable()
export class UserInfoEntry {
    @JsonProperty() pid: number;
    @JsonProperty(DECIMAL_BN_PROPERTY) totalDeposited: BN;
    @JsonProperty(DECIMAL_BN_PROPERTY) totalWithdrawn: BN;
}
