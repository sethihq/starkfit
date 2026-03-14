// SPDX-License-Identifier: MIT
// StarkFit - BTC Fitness Challenge Smart Contract
// Built on Starknet, powered by StarkZap SDK for gasless transactions
//
// Users stake WBTC to join a 30-day fitness challenge.
// Must walk 7,000+ steps daily or face elimination.
// Survivors split the pool (minus 5% platform fee).

use starknet::ContractAddress;

#[derive(Drop, Copy, Serde, starknet::Store)]
pub struct Challenge {
    pub creator: ContractAddress,
    pub stake_amount: u256,
    pub duration_days: u32,
    pub step_target: u32,
    pub start_time: u64,
    pub total_staked: u256,
    pub total_participants: u32,
    pub active_participants: u32,
    pub is_active: bool,
    pub is_completed: bool,
}

#[derive(Drop, Copy, Serde, starknet::Store)]
pub struct Participant {
    pub address: ContractAddress,
    pub is_active: bool,
    pub is_eliminated: bool,
    pub has_claimed: bool,
    pub current_streak: u32,
    pub total_steps: u256,
    pub join_time: u64,
}

#[starknet::interface]
pub trait IFitnessChallenge<TContractState> {
    // --- Write Functions ---

    /// Create a new fitness challenge with specified parameters.
    /// Returns true on success.
    fn create_challenge(
        ref self: TContractState,
        challenge_id: felt252,
        stake_amount: u256,
        duration_days: u32,
        step_target: u32,
    ) -> bool;

    /// Join an existing challenge by staking WBTC.
    /// Caller must have approved this contract to spend `stake_amount` of WBTC.
    fn join_challenge(ref self: TContractState, challenge_id: felt252) -> bool;

    /// Submit daily step proof for a participant.
    /// Only callable by the authorized oracle contract.
    fn submit_steps(
        ref self: TContractState,
        challenge_id: felt252,
        participant: ContractAddress,
        day: u32,
        steps: u32,
    ) -> bool;

    /// Eliminate a participant who missed their daily step target.
    /// Can be called by anyone after the day deadline has passed.
    fn eliminate_participant(
        ref self: TContractState,
        challenge_id: felt252,
        participant: ContractAddress,
    ) -> bool;

    /// Claim winnings after a challenge ends. Only callable by active (non-eliminated) participants.
    /// Returns the amount of WBTC claimed.
    fn claim_reward(ref self: TContractState, challenge_id: felt252) -> u256;

    // --- Admin Functions ---

    /// Set the authorized oracle contract address.
    fn set_oracle(ref self: TContractState, oracle: ContractAddress);

    /// Set the platform fee recipient address.
    fn set_fee_recipient(ref self: TContractState, recipient: ContractAddress);

    // --- View Functions ---

    /// Get challenge details.
    fn get_challenge(self: @TContractState, challenge_id: felt252) -> Challenge;

    /// Get participant details within a challenge.
    fn get_participant(
        self: @TContractState,
        challenge_id: felt252,
        participant: ContractAddress,
    ) -> Participant;

    /// Get total WBTC staked in a challenge pool.
    fn get_pool_balance(self: @TContractState, challenge_id: felt252) -> u256;

    /// Get the number of active (non-eliminated) participants.
    fn get_active_participants(self: @TContractState, challenge_id: felt252) -> u32;

    /// Check if a participant is still active in the challenge.
    fn is_participant_active(
        self: @TContractState,
        challenge_id: felt252,
        participant: ContractAddress,
    ) -> bool;

    /// Get the step count for a participant on a specific day.
    fn get_daily_steps(
        self: @TContractState,
        challenge_id: felt252,
        participant: ContractAddress,
        day: u32,
    ) -> u32;

    /// Get the WBTC token contract address.
    fn get_wbtc_address(self: @TContractState) -> ContractAddress;

    /// Get the oracle contract address.
    fn get_oracle(self: @TContractState) -> ContractAddress;
}

#[starknet::contract]
mod FitnessChallenge {
    use super::{Challenge, Participant, IFitnessChallenge};
    use starknet::{
        ContractAddress, get_caller_address, get_block_timestamp,
        storage::{Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess, StoragePointerWriteAccess},
    };
    use core::num::traits::Zero;
    use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

    // -----------------------------------------------------------------------
    //  Constants
    // -----------------------------------------------------------------------

    /// Platform fee: 5% (represented as 500 / 10_000 basis points).
    const PLATFORM_FEE_BPS: u256 = 500;
    const BPS_DENOMINATOR: u256 = 10_000;

    /// Seconds in one day — used for deadline calculations.
    const SECONDS_PER_DAY: u64 = 86400;

    // -----------------------------------------------------------------------
    //  Events
    // -----------------------------------------------------------------------

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        ChallengeCreated: ChallengeCreated,
        ParticipantJoined: ParticipantJoined,
        StepsSubmitted: StepsSubmitted,
        ParticipantEliminated: ParticipantEliminated,
        RewardClaimed: RewardClaimed,
        OracleUpdated: OracleUpdated,
    }

    #[derive(Drop, starknet::Event)]
    struct ChallengeCreated {
        #[key]
        challenge_id: felt252,
        creator: ContractAddress,
        stake_amount: u256,
        duration_days: u32,
        step_target: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct ParticipantJoined {
        #[key]
        challenge_id: felt252,
        #[key]
        participant: ContractAddress,
        stake_amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct StepsSubmitted {
        #[key]
        challenge_id: felt252,
        #[key]
        participant: ContractAddress,
        day: u32,
        steps: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct ParticipantEliminated {
        #[key]
        challenge_id: felt252,
        #[key]
        participant: ContractAddress,
        day: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct RewardClaimed {
        #[key]
        challenge_id: felt252,
        #[key]
        participant: ContractAddress,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct OracleUpdated {
        old_oracle: ContractAddress,
        new_oracle: ContractAddress,
    }

    // -----------------------------------------------------------------------
    //  Storage
    // -----------------------------------------------------------------------

    #[storage]
    struct Storage {
        /// Contract owner (deployer).
        owner: ContractAddress,

        /// WBTC ERC-20 token contract address.
        wbtc_token: ContractAddress,

        /// Authorized step oracle contract.
        oracle: ContractAddress,

        /// Platform fee recipient.
        fee_recipient: ContractAddress,

        /// challenge_id -> Challenge struct.
        challenges: Map<felt252, Challenge>,

        /// (challenge_id, participant_address) -> Participant struct.
        participants: Map<(felt252, ContractAddress), Participant>,

        /// (challenge_id, participant_address, day) -> step count.
        daily_steps: Map<(felt252, ContractAddress, u32), u32>,

        /// Track whether a challenge_id has been used.
        challenge_exists: Map<felt252, bool>,
    }

    // -----------------------------------------------------------------------
    //  Constructor
    // -----------------------------------------------------------------------

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        wbtc_token: ContractAddress,
        oracle: ContractAddress,
        fee_recipient: ContractAddress,
    ) {
        assert(!owner.is_zero(), 'Owner cannot be zero address');
        assert(!wbtc_token.is_zero(), 'WBTC addr cannot be zero');
        assert(!fee_recipient.is_zero(), 'Fee recv cannot be zero');

        self.owner.write(owner);
        self.wbtc_token.write(wbtc_token);
        self.oracle.write(oracle);
        self.fee_recipient.write(fee_recipient);
    }

    // -----------------------------------------------------------------------
    //  External Implementation
    // -----------------------------------------------------------------------

    #[abi(embed_v0)]
    impl FitnessChallengeImpl of IFitnessChallenge<ContractState> {
        // -------------------------------------------------------------------
        //  create_challenge
        // -------------------------------------------------------------------
        fn create_challenge(
            ref self: ContractState,
            challenge_id: felt252,
            stake_amount: u256,
            duration_days: u32,
            step_target: u32,
        ) -> bool {
            // Validate inputs
            assert(!self.challenge_exists.read(challenge_id), 'Challenge already exists');
            assert(stake_amount > 0, 'Stake must be > 0');
            assert(duration_days > 0, 'Duration must be > 0');
            assert(step_target > 0, 'Step target must be > 0');

            let caller = get_caller_address();
            let now = get_block_timestamp();

            let challenge = Challenge {
                creator: caller,
                stake_amount,
                duration_days,
                step_target,
                start_time: now,
                total_staked: 0,
                total_participants: 0,
                active_participants: 0,
                is_active: true,
                is_completed: false,
            };

            self.challenges.write(challenge_id, challenge);
            self.challenge_exists.write(challenge_id, true);

            self.emit(ChallengeCreated {
                challenge_id,
                creator: caller,
                stake_amount,
                duration_days,
                step_target,
            });

            true
        }

        // -------------------------------------------------------------------
        //  join_challenge
        // -------------------------------------------------------------------
        fn join_challenge(ref self: ContractState, challenge_id: felt252) -> bool {
            assert(self.challenge_exists.read(challenge_id), 'Challenge does not exist');

            let mut challenge = self.challenges.read(challenge_id);
            assert(challenge.is_active, 'Challenge not active');
            assert(!challenge.is_completed, 'Challenge already completed');

            let caller = get_caller_address();
            let existing = self.participants.read((challenge_id, caller));
            assert(existing.address.is_zero(), 'Already joined');

            // Transfer WBTC from caller to this contract
            let wbtc = IERC20Dispatcher { contract_address: self.wbtc_token.read() };
            let transfer_ok = wbtc.transfer_from(
                caller,
                starknet::get_contract_address(),
                challenge.stake_amount,
            );
            assert(transfer_ok, 'WBTC transfer failed');

            // Update challenge totals
            challenge.total_staked = challenge.total_staked + challenge.stake_amount;
            challenge.total_participants = challenge.total_participants + 1;
            challenge.active_participants = challenge.active_participants + 1;
            self.challenges.write(challenge_id, challenge);

            // Register participant
            let now = get_block_timestamp();
            let participant = Participant {
                address: caller,
                is_active: true,
                is_eliminated: false,
                has_claimed: false,
                current_streak: 0,
                total_steps: 0,
                join_time: now,
            };
            self.participants.write((challenge_id, caller), participant);

            self.emit(ParticipantJoined {
                challenge_id,
                participant: caller,
                stake_amount: challenge.stake_amount,
            });

            true
        }

        // -------------------------------------------------------------------
        //  submit_steps  (oracle-only)
        // -------------------------------------------------------------------
        fn submit_steps(
            ref self: ContractState,
            challenge_id: felt252,
            participant: ContractAddress,
            day: u32,
            steps: u32,
        ) -> bool {
            // Only the authorized oracle can submit step proofs
            let caller = get_caller_address();
            assert(caller == self.oracle.read(), 'Caller is not the oracle');

            assert(self.challenge_exists.read(challenge_id), 'Challenge does not exist');
            let challenge = self.challenges.read(challenge_id);
            assert(challenge.is_active, 'Challenge not active');
            assert(day >= 1 && day <= challenge.duration_days, 'Invalid day');

            let mut p = self.participants.read((challenge_id, participant));
            assert(!p.address.is_zero(), 'Not a participant');
            assert(p.is_active, 'Participant eliminated');

            // Record daily steps
            self.daily_steps.write((challenge_id, participant, day), steps);

            // Update participant stats
            let steps_u256: u256 = steps.into();
            p.total_steps = p.total_steps + steps_u256;

            if steps >= challenge.step_target {
                p.current_streak = p.current_streak + 1;
            } else {
                // Streak broken -- will be eligible for elimination
                p.current_streak = 0;
            }

            self.participants.write((challenge_id, participant), p);

            self.emit(StepsSubmitted {
                challenge_id,
                participant,
                day,
                steps,
            });

            true
        }

        // -------------------------------------------------------------------
        //  eliminate_participant
        // -------------------------------------------------------------------
        fn eliminate_participant(
            ref self: ContractState,
            challenge_id: felt252,
            participant: ContractAddress,
        ) -> bool {
            assert(self.challenge_exists.read(challenge_id), 'Challenge does not exist');

            let mut challenge = self.challenges.read(challenge_id);
            assert(challenge.is_active, 'Challenge not active');

            let mut p = self.participants.read((challenge_id, participant));
            assert(!p.address.is_zero(), 'Not a participant');
            assert(p.is_active, 'Already eliminated');

            // Determine current day of the challenge
            let now = get_block_timestamp();
            let elapsed = now - challenge.start_time;
            let current_day: u32 = (elapsed / SECONDS_PER_DAY).try_into().unwrap() + 1;

            // Check if the participant missed yesterday's target.
            // We check the *previous* day because today is still in progress.
            let check_day = if current_day > 1 {
                current_day - 1
            } else {
                // Can't eliminate on day 1 before it finishes
                0
            };

            assert(check_day >= 1, 'Too early to eliminate');
            assert(check_day <= challenge.duration_days, 'Challenge period ended');

            let recorded_steps = self.daily_steps.read((challenge_id, participant, check_day));
            assert(recorded_steps < challenge.step_target, 'Met step target');

            // Eliminate
            p.is_active = false;
            p.is_eliminated = true;
            p.current_streak = 0;
            self.participants.write((challenge_id, participant), p);

            challenge.active_participants = challenge.active_participants - 1;
            self.challenges.write(challenge_id, challenge);

            self.emit(ParticipantEliminated {
                challenge_id,
                participant,
                day: check_day,
            });

            true
        }

        // -------------------------------------------------------------------
        //  claim_reward
        // -------------------------------------------------------------------
        fn claim_reward(ref self: ContractState, challenge_id: felt252) -> u256 {
            assert(self.challenge_exists.read(challenge_id), 'Challenge does not exist');

            let mut challenge = self.challenges.read(challenge_id);

            // Check that the challenge duration has elapsed
            let now = get_block_timestamp();
            let end_time = challenge.start_time
                + (challenge.duration_days.into() * SECONDS_PER_DAY);
            assert(now >= end_time, 'Challenge not yet ended');

            // Mark challenge as completed if not already
            if !challenge.is_completed {
                challenge.is_completed = true;
                challenge.is_active = false;
                self.challenges.write(challenge_id, challenge);
            }

            let caller = get_caller_address();
            let mut p = self.participants.read((challenge_id, caller));
            assert(!p.address.is_zero(), 'Not a participant');
            assert(p.is_active, 'Participant was eliminated');
            assert(!p.has_claimed, 'Already claimed');

            // Calculate reward: pool * (1 - 5%) / active_participants
            let pool = challenge.total_staked;
            let fee = (pool * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
            let distributable = pool - fee;
            let active: u256 = challenge.active_participants.into();
            assert(active > 0, 'No active participants');
            let reward = distributable / active;

            // Mark as claimed
            p.has_claimed = true;
            self.participants.write((challenge_id, caller), p);

            // Transfer reward to participant
            let wbtc = IERC20Dispatcher { contract_address: self.wbtc_token.read() };
            let ok = wbtc.transfer(caller, reward);
            assert(ok, 'Reward transfer failed');

            // Transfer fee to platform (only once, on first claim — simplified)
            // In production you'd track fee_paid per challenge. For hackathon MVP
            // the fee is effectively deducted from the pool math above.
            if fee > 0 {
                let fee_recipient = self.fee_recipient.read();
                if !fee_recipient.is_zero() {
                    // Fee is proportional per claimant:  fee / active_participants
                    let fee_share = fee / active;
                    let _ = wbtc.transfer(fee_recipient, fee_share);
                }
            }

            self.emit(RewardClaimed {
                challenge_id,
                participant: caller,
                amount: reward,
            });

            reward
        }

        // -------------------------------------------------------------------
        //  Admin: set_oracle
        // -------------------------------------------------------------------
        fn set_oracle(ref self: ContractState, oracle: ContractAddress) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Only owner');
            assert(!oracle.is_zero(), 'Oracle cannot be zero');

            let old = self.oracle.read();
            self.oracle.write(oracle);

            self.emit(OracleUpdated {
                old_oracle: old,
                new_oracle: oracle,
            });
        }

        // -------------------------------------------------------------------
        //  Admin: set_fee_recipient
        // -------------------------------------------------------------------
        fn set_fee_recipient(ref self: ContractState, recipient: ContractAddress) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Only owner');
            assert(!recipient.is_zero(), 'Recipient cannot be zero');
            self.fee_recipient.write(recipient);
        }

        // -------------------------------------------------------------------
        //  View functions
        // -------------------------------------------------------------------

        fn get_challenge(self: @ContractState, challenge_id: felt252) -> Challenge {
            assert(self.challenge_exists.read(challenge_id), 'Challenge does not exist');
            self.challenges.read(challenge_id)
        }

        fn get_participant(
            self: @ContractState,
            challenge_id: felt252,
            participant: ContractAddress,
        ) -> Participant {
            self.participants.read((challenge_id, participant))
        }

        fn get_pool_balance(self: @ContractState, challenge_id: felt252) -> u256 {
            let challenge = self.challenges.read(challenge_id);
            challenge.total_staked
        }

        fn get_active_participants(self: @ContractState, challenge_id: felt252) -> u32 {
            let challenge = self.challenges.read(challenge_id);
            challenge.active_participants
        }

        fn is_participant_active(
            self: @ContractState,
            challenge_id: felt252,
            participant: ContractAddress,
        ) -> bool {
            let p = self.participants.read((challenge_id, participant));
            p.is_active
        }

        fn get_daily_steps(
            self: @ContractState,
            challenge_id: felt252,
            participant: ContractAddress,
            day: u32,
        ) -> u32 {
            self.daily_steps.read((challenge_id, participant, day))
        }

        fn get_wbtc_address(self: @ContractState) -> ContractAddress {
            self.wbtc_token.read()
        }

        fn get_oracle(self: @ContractState) -> ContractAddress {
            self.oracle.read()
        }
    }
}
