import {
    Field,
    SmartContract,
    state,
    State,
    method,
    Bool,
} from 'o1js';

export class Range extends SmartContract {
    @state(Bool) status = State<Bool>();
    init() {
        super.init();
        this.status.set(Bool(false));
    }

    //proves that num is between 0 and 100 (range proof)
    @method async update(num: Field) {
        const currentState = this.status.get();
        this.status.requireEquals(currentState); //Why this line?
        currentState.assertEquals(Bool(false));
        num.assertGreaterThanOrEqual(0);
        num.assertLessThanOrEqual(100);
        
        this.status.set(Bool(true));
    }
}