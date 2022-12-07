import {
  ContractTransaction,
  ContractInterface,
  BytesLike as Arrayish,
  BigNumber,
  BigNumberish,
} from 'ethers';
import { EthersContractContextV5 } from 'ethereum-abi-types-generator';

export type ContractContext = EthersContractContextV5<
  Master,
  MasterMethodNames,
  MasterEventsContext,
  MasterEvents
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
export type MasterEvents =
  | 'Add'
  | 'AddBulk'
  | 'CancelTransaction'
  | 'Deposit'
  | 'Drain'
  | 'ExecuteTransaction'
  | 'NewAdmin'
  | 'NewDelay'
  | 'NewPendingAdmin'
  | 'OwnershipTransferred'
  | 'QueueTransaction'
  | 'UpdateAdapter'
  | 'UpdateTargetInfo'
  | 'Withdraw'
  | 'WithdrawAndUnzap'
  | 'WithdrawAndUnzapRouted'
  | 'ZapAndDeposit'
  | 'ZapAndDepositRouted';
export interface MasterEventsContext {
  Add(...parameters: any): EventFilter;
  AddBulk(...parameters: any): EventFilter;
  CancelTransaction(...parameters: any): EventFilter;
  Deposit(...parameters: any): EventFilter;
  Drain(...parameters: any): EventFilter;
  ExecuteTransaction(...parameters: any): EventFilter;
  NewAdmin(...parameters: any): EventFilter;
  NewDelay(...parameters: any): EventFilter;
  NewPendingAdmin(...parameters: any): EventFilter;
  OwnershipTransferred(...parameters: any): EventFilter;
  QueueTransaction(...parameters: any): EventFilter;
  UpdateAdapter(...parameters: any): EventFilter;
  UpdateTargetInfo(...parameters: any): EventFilter;
  Withdraw(...parameters: any): EventFilter;
  WithdrawAndUnzap(...parameters: any): EventFilter;
  WithdrawAndUnzapRouted(...parameters: any): EventFilter;
  ZapAndDeposit(...parameters: any): EventFilter;
  ZapAndDepositRouted(...parameters: any): EventFilter;
}
export type MasterMethodNames =
  | 'acceptAdmin'
  | 'addBulk'
  | 'cancelTransaction'
  | 'deposit'
  | 'deposit'
  | 'drain'
  | 'executeTransaction'
  | 'massUpdateAdapter'
  | 'massUpdateTarget'
  | 'poolUpdate'
  | 'queueTransaction'
  | 'renounceOwnership'
  | 'setDelay'
  | 'setPendingAdmin'
  | 'transfer'
  | 'transferOwnership'
  | 'updateCustodian'
  | 'updateDrainAddress'
  | 'updatePoolModifiers'
  | 'updateProtection'
  | 'updateService'
  | 'updateTargetInfo'
  | 'withdraw'
  | 'withdrawAndUnzapRouted'
  | 'zapAndDeposit'
  | 'zapAndDeposit'
  | 'zapAndDepositRouted'
  | 'zapAndDepositRouted'
  | 'new'
  | 'admin'
  | 'admin_initialized'
  | 'custodianAddress'
  | 'delay'
  | 'drainAddress'
  | 'drainProtection'
  | 'earnedRewards'
  | 'GRACE_PERIOD'
  | 'MAXIMUM_DELAY'
  | 'MINIMUM_DELAY'
  | 'owner'
  | 'pendingAdmin'
  | 'poolInfo'
  | 'poolLength'
  | 'queuedTransactions'
  | 'serviceAddress'
  | 'userDeposits'
  | 'userInfo';
export interface EarnedRewardsResponse {
  a: string[];
  0: string[];
  b: BigNumber[];
  1: BigNumber[];
  length: 2;
}
export interface PoolInfoResponse {
  target: string;
  0: string;
  adapter: string;
  1: string;
  targetPoolId: BigNumber;
  2: BigNumber;
  drainModifier: BigNumber;
  3: BigNumber;
  totalShares: BigNumber;
  4: BigNumber;
  totalDeposits: BigNumber;
  5: BigNumber;
  entranceFee: BigNumber;
  6: BigNumber;
  length: 7;
}
export interface Master {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  acceptAdmin(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _target Type: address, Indexed: false
   * @param _adapter Type: address, Indexed: false
   * @param targetPids Type: uint256[], Indexed: false
   * @param drainModifiers Type: uint256[], Indexed: false
   * @param entranceFees Type: uint256[], Indexed: false
   */
  addBulk(
    _target: string,
    _adapter: string,
    targetPids: BigNumberish[],
    drainModifiers: BigNumberish[],
    entranceFees: BigNumberish[],
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param target Type: address, Indexed: false
   * @param value Type: uint256, Indexed: false
   * @param signature Type: string, Indexed: false
   * @param data Type: bytes, Indexed: false
   * @param eta Type: uint256, Indexed: false
   */
  cancelTransaction(
    target: string,
    value: BigNumberish,
    signature: string,
    data: Arrayish,
    eta: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _pid Type: uint256, Indexed: false
   * @param _amount Type: uint256, Indexed: false
   * @param _user Type: address, Indexed: false
   */
  deposit(
    _pid: BigNumberish,
    _amount: BigNumberish,
    _user: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _pid Type: uint256, Indexed: false
   * @param _amount Type: uint256, Indexed: false
   */
  deposit(
    _pid: BigNumberish,
    _amount: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _pid Type: uint256, Indexed: false
   * @param amounts Type: uint256[], Indexed: false
   */
  drain(
    _pid: BigNumberish,
    amounts: BigNumberish[],
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param target Type: address, Indexed: false
   * @param _value Type: uint256, Indexed: false
   * @param signature Type: string, Indexed: false
   * @param data Type: bytes, Indexed: false
   * @param eta Type: uint256, Indexed: false
   */
  executeTransaction(
    target: string,
    _value: BigNumberish,
    signature: string,
    data: Arrayish,
    eta: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _pids Type: uint256[], Indexed: false
   * @param _adapter Type: address, Indexed: false
   */
  massUpdateAdapter(
    _pids: BigNumberish[],
    _adapter: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _pids Type: uint256[], Indexed: false
   * @param _targets Type: address[], Indexed: false
   * @param _adapters Type: address[], Indexed: false
   * @param _targetPoolIds Type: uint256[], Indexed: false
   * @param restake Type: bool[], Indexed: false
   */
  massUpdateTarget(
    _pids: BigNumberish[],
    _targets: string[],
    _adapters: string[],
    _targetPoolIds: BigNumberish[],
    restake: boolean[],
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _pid Type: uint256, Indexed: false
   * @param _amount Type: uint256, Indexed: false
   */
  poolUpdate(
    _pid: BigNumberish,
    _amount: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param target Type: address, Indexed: false
   * @param value Type: uint256, Indexed: false
   * @param signature Type: string, Indexed: false
   * @param data Type: bytes, Indexed: false
   * @param eta Type: uint256, Indexed: false
   */
  queueTransaction(
    target: string,
    value: BigNumberish,
    signature: string,
    data: Arrayish,
    eta: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  renounceOwnership(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param delay_ Type: uint256, Indexed: false
   */
  setDelay(
    delay_: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param pendingAdmin_ Type: address, Indexed: false
   */
  setPendingAdmin(
    pendingAdmin_: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _pid Type: uint256, Indexed: false
   * @param _amount Type: uint256, Indexed: false
   * @param _user Type: address, Indexed: false
   */
  transfer(
    _pid: BigNumberish,
    _amount: BigNumberish,
    _user: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newOwner Type: address, Indexed: false
   */
  transferOwnership(
    newOwner: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _custodianAddress Type: address, Indexed: false
   */
  updateCustodian(
    _custodianAddress: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _drainAddress Type: address, Indexed: false
   */
  updateDrainAddress(
    _drainAddress: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _pid Type: uint256, Indexed: false
   * @param _drainModifier Type: uint256, Indexed: false
   * @param _entranceFee Type: uint256, Indexed: false
   */
  updatePoolModifiers(
    _pid: BigNumberish,
    _drainModifier: BigNumberish,
    _entranceFee: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _drainProtection Type: bool, Indexed: false
   */
  updateProtection(
    _drainProtection: boolean,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _serviceAddress Type: address, Indexed: false
   */
  updateService(
    _serviceAddress: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _pid Type: uint256, Indexed: false
   * @param _target Type: address, Indexed: false
   * @param _adapter Type: address, Indexed: false
   * @param _targetPoolId Type: uint256, Indexed: false
   * @param restake Type: bool, Indexed: false
   */
  updateTargetInfo(
    _pid: BigNumberish,
    _target: string,
    _adapter: string,
    _targetPoolId: BigNumberish,
    restake: boolean,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _pid Type: uint256, Indexed: false
   * @param _amount Type: uint256, Indexed: false
   */
  withdraw(
    _pid: BigNumberish,
    _amount: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param token Type: address, Indexed: false
   * @param call Type: bytes, Indexed: false
   * @param _pid Type: uint256, Indexed: false
   * @param _amount Type: uint256, Indexed: false
   * @param min_out Type: uint256, Indexed: false
   */
  withdrawAndUnzapRouted(
    token: string,
    call: Arrayish,
    _pid: BigNumberish,
    _amount: BigNumberish,
    min_out: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param token Type: address, Indexed: false
   * @param _pid Type: uint256, Indexed: false
   * @param _amount Type: uint256, Indexed: false
   * @param min_out Type: uint256, Indexed: false
   */
  zapAndDeposit(
    token: string,
    _pid: BigNumberish,
    _amount: BigNumberish,
    min_out: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param token Type: address, Indexed: false
   * @param _pid Type: uint256, Indexed: false
   * @param _amount Type: uint256, Indexed: false
   * @param min_out Type: uint256, Indexed: false
   * @param _user Type: address, Indexed: false
   */
  zapAndDeposit(
    token: string,
    _pid: BigNumberish,
    _amount: BigNumberish,
    min_out: BigNumberish,
    _user: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param token Type: address, Indexed: false
   * @param call Type: bytes, Indexed: false
   * @param _pid Type: uint256, Indexed: false
   * @param _amount Type: uint256, Indexed: false
   * @param min_out Type: uint256, Indexed: false
   * @param _user Type: address, Indexed: false
   */
  zapAndDepositRouted(
    token: string,
    call: Arrayish,
    _pid: BigNumberish,
    _amount: BigNumberish,
    min_out: BigNumberish,
    _user: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param token Type: address, Indexed: false
   * @param call Type: bytes, Indexed: false
   * @param _pid Type: uint256, Indexed: false
   * @param _amount Type: uint256, Indexed: false
   * @param min_out Type: uint256, Indexed: false
   */
  zapAndDepositRouted(
    token: string,
    call: Arrayish,
    _pid: BigNumberish,
    _amount: BigNumberish,
    min_out: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: constructor
   * @param _drainAddress Type: address, Indexed: false
   */
  'new'(
    _drainAddress: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  admin(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  admin_initialized(overrides?: ContractCallOverrides): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  custodianAddress(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  delay(overrides?: ContractCallOverrides): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  drainAddress(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  drainProtection(overrides?: ContractCallOverrides): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param _pid Type: uint256, Indexed: false
   * @param _user Type: address, Indexed: false
   */
  earnedRewards(
    _pid: BigNumberish,
    _user: string,
    overrides?: ContractCallOverrides
  ): Promise<EarnedRewardsResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  GRACE_PERIOD(overrides?: ContractCallOverrides): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  MAXIMUM_DELAY(overrides?: ContractCallOverrides): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  MINIMUM_DELAY(overrides?: ContractCallOverrides): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  owner(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  pendingAdmin(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param a Type: uint256, Indexed: false
   */
  poolInfo(
    a: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<PoolInfoResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  poolLength(overrides?: ContractCallOverrides): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param a Type: bytes32, Indexed: false
   */
  queuedTransactions(
    a: Arrayish,
    overrides?: ContractCallOverrides
  ): Promise<boolean>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  serviceAddress(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param _pid Type: uint256, Indexed: false
   * @param _user Type: address, Indexed: false
   */
  userDeposits(
    _pid: BigNumberish,
    _user: string,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param a Type: uint256, Indexed: false
   * @param b Type: address, Indexed: false
   */
  userInfo(
    a: BigNumberish,
    b: string,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>;
}
