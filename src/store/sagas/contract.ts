import { call, put, takeEvery, take, fork, all } from 'redux-saga/effects'
import AggregatorABI from '@chainlink/contracts/abi/v0.4/Aggregator.json'
import { contracts as contractsDefault } from "../../data/contracts"
import { web3ForNetworkId } from "../../web3global"

import {
    DrizzleTypes,
    ContractTypes,
} from "../types"

import {
    DrizzleActions,
    EventActions,
    ContractActions,
} from "../actions"

function* setupDefaultContracts() {
    const allContracts = [].concat.apply([], Object.values(contractsDefault));
    yield all(allContracts.map((c) => {
        const abi = AggregatorABI.compilerOutput.abi
        const events = ["AnswerUpdated", "ResponseReceived"]

        return put(ContractActions.createContract({ ...c, abi, events }))
    }))
}


function* updateContractEvents(action: ContractTypes.UpdateContractEventsAction) {
    const { web3Contract, address, networkId } = action.payload

    try {
        const latestRound = yield call(web3Contract.methods.latestRound().call)

        /*
        yield put({
            type: 'CALL_CONTRACT_FN',
            contract: address,
            fnName: 'latestRound',
            fnIndex: '0x0',
            args,
            argsHash,
            sync: true
          })*/



        yield put(EventActions.fetchEvent({
            event: 'ResponseReceived',
            options: {
                fromBlock: 0,
                toBlock: 'latest',
                filter: { answerId: latestRound }
            },
            networkId: networkId,
            max: 25
        }, web3Contract))

        const pastRounds = []
        for (let i = Math.max(latestRound - 50, 0); i <= latestRound; i++) {
            pastRounds.push(i)
        }

        yield all(pastRounds.map((roundId) => put(EventActions.fetchEvent({
            event: 'AnswerUpdated',
            name: address,
            options: {
                fromBlock: 0,
                toBlock: 'latest',
                filter: { roundId }
            },
            networkId: networkId,
            max: 1
        }, web3Contract))))

    } catch (error) {
        console.error(error)
    }



}

// fetch data from service using sagas
export function* contractSetup(action: ContractTypes.SetupContractAction) {
    const { address, events, abi, networkId } = action.payload
    const web3 = web3ForNetworkId(networkId)!;
    const web3Contract = new web3.eth.Contract(abi, address)
    const contractConfig = {
        contractName: address,
        web3Contract
    }

    //yield all(events.map(event => put(EventActions.createEvent({ address, event }))));
    yield all(events.map(event => put(EventActions.createEventIndex({ address, event }))));
    yield put(DrizzleActions.addDrizzleContract({ contractConfig, events }))

}

// Combine all your redux concerns

// app root saga
export function* contractRootSaga() {
    yield takeEvery(DrizzleTypes.DRIZZLE_INITIALIZED, setupDefaultContracts)
    yield takeEvery(ContractTypes.SETUP_CONTRACT, contractSetup)
    yield takeEvery(ContractTypes.UPDATE_CONTRACT_EVENTS, updateContractEvents)
}