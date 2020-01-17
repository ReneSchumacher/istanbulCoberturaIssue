import { describe, it } from 'mocha';
import { should } from 'chai';
should();

import SimpleClass from '../src/simpleClass';

describe('SimpleClass', () => {

    it('should return value', () => {
        const sc = new SimpleClass();
        sc.doSomething(1).should.be.equal(15);
        sc.doSomething(3).should.be.equal(45);
    });

});