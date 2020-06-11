import { LightningElement, wire } from 'lwc';
import  getDistinctTests  from '@salesforce/apex/UnitTestController.getDistinctTests';

export default class TestList extends LightningElement {

    testList;
    testChosen;
    err;
   
    // You need to put "executable statements" inside a function, like console.log
    @wire(getDistinctTests) 
    tests ({error,data}){
        console.log('getDistinctTests ==> tests: ',data);
        this.testList = data;
        this.err = error;
    }

    testClick(event) {
        console.log('testClick ==> : ',event.target.dataset.key);
        const selectEvent = new CustomEvent('testclick', {
            detail: event.target.dataset.key
        });
        // 3. Fire the custom event
        this.dispatchEvent(selectEvent);
    }
    
}