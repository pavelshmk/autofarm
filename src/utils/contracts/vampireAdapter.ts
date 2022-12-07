import {
  ContractTransaction,
  ContractInterface,
  BytesLike as Arrayish,
  BigNumber,
  BigNumberish,
} from 'ethers';
import { EthersContractContextV5 } from 'ethereum-abi-types-generator';

export type ContractContext = EthersContractContextV5<
  VampireAdapter,
  VampireAdapterMethodNames,
  VampireAdapterEventsContext,
  VampireAdapterEvents
>;

export declare type EventFilter = {
  address?: string;
  topics?: Array<string>;
  fromBlock?: string | number;
  toBlock?: string | number;
};

export interface ContractTransactionOverrides {
  /**
   * The maximum units of gas for the transaction to use
   */
  gasLimit?: number;
  /**
   * The price (in wei) per unit of gas
   */
  gasPrice?: BigNumber | string | number | Promise<any>;
  /**
   * The nonce to use in the transaction
   */
  nonce?: number;
  /**
   * The amount to send with the transaction (i.e. msg.value)
   */
  value?: BigNumber | string | number | Promise<any>;
  /**
   * The chain ID (or network ID) to use
   */
  chainId?: number;
}

export interface ContractCallOverrides {
  /**
   * The address to execute the call as
   */
  from?: string;
  /**
   * The maximum units of gas for the transaction to use
   */
  gasLimit?: number;
}
export type VampireAdapterEvents = undefined;
export interface VampireAdapterEventsContext {}
export type VampireAdapterMethodNames =
  | 'claimReward'
  | 'deposit'
  | 'emergencyWithdraw'
  | 'lockableToken'
  | 'lockedAmount'
  | 'lockedValue'
  | 'normalizedAPY'
  | 'poolAddress'
  | 'poolCount'
  | 'rewardToWethPool'
  | 'rewardToken'
  | 'sellRewardForWeth'
  | 'sellableRewardAmount'
  | 'totalLockedValue'
  | 'withdraw';
export interface VampireAdapter {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   * @param poolId Type: uint256, Indexed: false
   */
  claimReward(
    parameter0: string,
    poolId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _adapter Type: address, Indexed: false
   * @param poolId Type: uint256, Indexed: false
   * @param amount Type: uint256, Indexed: false
   */
  deposit(
    _adapter: string,
    poolId: BigNumberish,
    amount: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   * @param poolId Type: uint256, Indexed: false
   */
  emergencyWithdraw(
    parameter0: string,
    poolId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param poolId Type: uint256, Indexed: false
   */
  lockableToken(
    poolId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param user Type: address, Indexed: false
   * @param poolId Type: uint256, Indexed: false
   */
  lockedAmount(
    user: string,
    poolId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: pure
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   * @param parameter1 Type: uint256, Indexed: false
   */
  lockedValue(
    parameter0: string,
    parameter1: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: pure
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   */
  normalizedAPY(
    parameter0: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: pure
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   */
  poolAddress(
    parameter0: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  poolCount(overrides?: ContractCallOverrides): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: pure
   * Type: function
   */
  rewardToWethPool(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: pure
   * Type: function
   */
  rewardToken(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   * @param rewardAmount Type: uint256, Indexed: false
   * @param to Type: address, Indexed: false
   */
  sellRewardForWeth(
    parameter0: string,
    rewardAmount: BigNumberish,
    to: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: pure
   * Type: function
   */
  sellableRewardAmount(overrides?: ContractCallOverrides): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: pure
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   */
  totalLockedValue(
    parameter0: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   * @param poolId Type: uint256, Indexed: false
   * @param amount Type: uint256, Indexed: false
   */
  withdraw(
    parameter0: string,
    poolId: BigNumberish,
    amount: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
}
