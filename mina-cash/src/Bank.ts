import {
    SmartContract,
    Poseidon,
    Field,
    State,
    state,
    PublicKey,
    Mina,
    method,
    UInt32,
    MerkleMap,
    MerkleMapWitness,
    Struct,
    Permissions,
    UInt64,
} from 'o1js';

export class Bank extends SmartContract {
    @state(Field) balanceRoot = State<Field>();
    @state(Field) creditScoreRoot = State<Field>();

    init() {
        super.init();
    }

    //We need to make sure that this function is only called by the bank!
    @method async initState(initialBalanceRoot: Field, initialCreditRoot: Field) {
        this.balanceRoot.set(initialBalanceRoot);
        this.creditScoreRoot.set(initialCreditRoot);
    }

    @method async proveBalance(keyWitness: MerkleMapWitness, provenUuid: Field, value: Field, threshold: Field) {
        const balanceRoot = this.balanceRoot.get();
        this.balanceRoot.requireEquals(balanceRoot);
        const [rootBefore, uuid] = keyWitness.computeRootAndKey(value);
        rootBefore.assertEquals(balanceRoot);
        uuid.assertEquals(provenUuid);

        value.assertGreaterThanOrEqual(threshold);

    }

    @method async proveCreditScore(keyWitness: MerkleMapWitness, provenUuid: Field, value: Field, threshold: Field) {
        const creditRoot = this.creditScoreRoot.get();
        this.creditScoreRoot.requireEquals(creditRoot);
        const [rootBefore, uuid] = keyWitness.computeRootAndKey(value);
        rootBefore.assertEquals(creditRoot);
        uuid.assertEquals(provenUuid);
        
        value.assertGreaterThanOrEqual(threshold);

    }
}


