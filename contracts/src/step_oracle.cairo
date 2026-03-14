// SPDX-License-Identifier: MIT
// StarkFit - Step Oracle Contract
//
// Verifies step data sourced from Google Fit API.
// An authorized off-chain oracle submits verified step counts,
// which are forwarded to the FitnessChallenge contract.
//
// Flow:
//   Google Fit API -> Off-chain Oracle Server -> This Contract -> FitnessChallenge

use starknet::ContractAddress;

#[starknet::interface]
pub trait IStepOracle<TContractState> {
    /// Submit verified steps for a participant. Only callable by the authorized oracle signer.
    /// Forwards the data to the FitnessChallenge contract.
    fn submit_verified_steps(
        ref self: TContractState,
        challenge_id: felt252,
        participant: ContractAddress,
        day: u32,
        steps: u32,
    ) -> bool;

    /// Submit steps for multiple participants in a single transaction (batch).
    fn batch_submit_steps(
        ref self: TContractState,
        challenge_id: felt252,
        participants: Span<ContractAddress>,
        days: Span<u32>,
        steps: Span<u32>,
    ) -> bool;

    // --- Admin ---

    /// Update the authorized oracle signer address.
    fn set_oracle_signer(ref self: TContractState, new_signer: ContractAddress);

    /// Update the FitnessChallenge contract address.
    fn set_challenge_contract(ref self: TContractState, challenge_contract: ContractAddress);

    // --- Views ---

    /// Get the authorized oracle signer address.
    fn get_oracle_signer(self: @TContractState) -> ContractAddress;

    /// Get the FitnessChallenge contract address.
    fn get_challenge_contract(self: @TContractState) -> ContractAddress;

    /// Check if steps have already been submitted for a (challenge, participant, day).
    fn is_submitted(
        self: @TContractState,
        challenge_id: felt252,
        participant: ContractAddress,
        day: u32,
    ) -> bool;

    /// Get the recorded step count for a given submission.
    fn get_submitted_steps(
        self: @TContractState,
        challenge_id: felt252,
        participant: ContractAddress,
        day: u32,
    ) -> u32;
}

#[starknet::contract]
mod StepOracle {
    use super::IStepOracle;
    use starknet::{
        ContractAddress, get_caller_address,
        storage::{Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess, StoragePointerWriteAccess},
    };
    use core::num::traits::Zero;

    // Import the FitnessChallenge dispatcher to call submit_steps
    use crate::fitness_challenge::{IFitnessChallengeDispatcher, IFitnessChallengeDispatcherTrait};

    // -----------------------------------------------------------------------
    //  Events
    // -----------------------------------------------------------------------

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        StepsVerified: StepsVerified,
        OracleSignerUpdated: OracleSignerUpdated,
        ChallengeContractUpdated: ChallengeContractUpdated,
    }

    #[derive(Drop, starknet::Event)]
    struct StepsVerified {
        #[key]
        challenge_id: felt252,
        #[key]
        participant: ContractAddress,
        day: u32,
        steps: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct OracleSignerUpdated {
        old_signer: ContractAddress,
        new_signer: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct ChallengeContractUpdated {
        old_contract: ContractAddress,
        new_contract: ContractAddress,
    }

    // -----------------------------------------------------------------------
    //  Storage
    // -----------------------------------------------------------------------

    #[storage]
    struct Storage {
        /// Contract owner / admin.
        owner: ContractAddress,

        /// The authorized off-chain oracle signer.
        oracle_signer: ContractAddress,

        /// The FitnessChallenge contract to forward steps to.
        challenge_contract: ContractAddress,

        /// Track submissions: (challenge_id, participant, day) -> bool.
        submitted: Map<(felt252, ContractAddress, u32), bool>,

        /// Recorded steps: (challenge_id, participant, day) -> step count.
        recorded_steps: Map<(felt252, ContractAddress, u32), u32>,
    }

    // -----------------------------------------------------------------------
    //  Constructor
    // -----------------------------------------------------------------------

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        oracle_signer: ContractAddress,
        challenge_contract: ContractAddress,
    ) {
        assert(!owner.is_zero(), 'Owner cannot be zero');
        assert(!oracle_signer.is_zero(), 'Signer cannot be zero');
        assert(!challenge_contract.is_zero(), 'Challenge addr cannot be zero');

        self.owner.write(owner);
        self.oracle_signer.write(oracle_signer);
        self.challenge_contract.write(challenge_contract);
    }

    // -----------------------------------------------------------------------
    //  Implementation
    // -----------------------------------------------------------------------

    #[abi(embed_v0)]
    impl StepOracleImpl of IStepOracle<ContractState> {
        fn submit_verified_steps(
            ref self: ContractState,
            challenge_id: felt252,
            participant: ContractAddress,
            day: u32,
            steps: u32,
        ) -> bool {
            // Only the authorized oracle signer can submit
            let caller = get_caller_address();
            assert(caller == self.oracle_signer.read(), 'Not authorized oracle');

            // Prevent duplicate submissions
            assert(
                !self.submitted.read((challenge_id, participant, day)),
                'Steps already submitted',
            );

            // Record locally
            self.submitted.write((challenge_id, participant, day), true);
            self.recorded_steps.write((challenge_id, participant, day), steps);

            // Forward to FitnessChallenge contract
            let challenge_addr = self.challenge_contract.read();
            let challenge_dispatcher = IFitnessChallengeDispatcher {
                contract_address: challenge_addr,
            };
            let ok = challenge_dispatcher.submit_steps(challenge_id, participant, day, steps);
            assert(ok, 'Challenge submit failed');

            self.emit(StepsVerified {
                challenge_id,
                participant,
                day,
                steps,
            });

            true
        }

        fn batch_submit_steps(
            ref self: ContractState,
            challenge_id: felt252,
            participants: Span<ContractAddress>,
            days: Span<u32>,
            steps: Span<u32>,
        ) -> bool {
            // Validate array lengths match
            let len = participants.len();
            assert(len == days.len(), 'Array length mismatch');
            assert(len == steps.len(), 'Array length mismatch');
            assert(len > 0, 'Empty batch');

            // Only the authorized oracle signer can submit
            let caller = get_caller_address();
            assert(caller == self.oracle_signer.read(), 'Not authorized oracle');

            let challenge_addr = self.challenge_contract.read();
            let challenge_dispatcher = IFitnessChallengeDispatcher {
                contract_address: challenge_addr,
            };

            let mut i: u32 = 0;
            while i < len {
                let participant = *participants.at(i);
                let day = *days.at(i);
                let step_count = *steps.at(i);

                // Skip if already submitted (don't revert entire batch)
                if !self.submitted.read((challenge_id, participant, day)) {
                    self.submitted.write((challenge_id, participant, day), true);
                    self.recorded_steps.write((challenge_id, participant, day), step_count);

                    let _ = challenge_dispatcher.submit_steps(
                        challenge_id, participant, day, step_count,
                    );

                    self.emit(StepsVerified {
                        challenge_id,
                        participant,
                        day,
                        steps: step_count,
                    });
                }

                i += 1;
            };

            true
        }

        // -------------------------------------------------------------------
        //  Admin
        // -------------------------------------------------------------------

        fn set_oracle_signer(ref self: ContractState, new_signer: ContractAddress) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Only owner');
            assert(!new_signer.is_zero(), 'Signer cannot be zero');

            let old = self.oracle_signer.read();
            self.oracle_signer.write(new_signer);

            self.emit(OracleSignerUpdated {
                old_signer: old,
                new_signer,
            });
        }

        fn set_challenge_contract(ref self: ContractState, challenge_contract: ContractAddress) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Only owner');
            assert(!challenge_contract.is_zero(), 'Addr cannot be zero');

            let old = self.challenge_contract.read();
            self.challenge_contract.write(challenge_contract);

            self.emit(ChallengeContractUpdated {
                old_contract: old,
                new_contract: challenge_contract,
            });
        }

        // -------------------------------------------------------------------
        //  Views
        // -------------------------------------------------------------------

        fn get_oracle_signer(self: @ContractState) -> ContractAddress {
            self.oracle_signer.read()
        }

        fn get_challenge_contract(self: @ContractState) -> ContractAddress {
            self.challenge_contract.read()
        }

        fn is_submitted(
            self: @ContractState,
            challenge_id: felt252,
            participant: ContractAddress,
            day: u32,
        ) -> bool {
            self.submitted.read((challenge_id, participant, day))
        }

        fn get_submitted_steps(
            self: @ContractState,
            challenge_id: felt252,
            participant: ContractAddress,
            day: u32,
        ) -> u32 {
            self.recorded_steps.read((challenge_id, participant, day))
        }
    }
}
