import { LightningElement, wire, track } from 'lwc';
import  getDistinctSubTests  from '@salesforce/apex/UnitTestController.getDistinctSubTests';

export default class TestSelector extends LightningElement {

testName;
subTestName;
subTests;
subTestResults;
error;
@track columns;
@track jsondata;


handleTestClick(evt) {
    this.testName = evt.detail;
    //console.log('==>Selector test chosen: ', evt.detail);
    console.log('==>Selector handleTestClick: ', this.testName);

}

handleSubTestClick(evt) {
    this.subTestName = evt.detail;
    //console.log('==>Selector test chosen: ', evt.detail);
    console.log('==>Selector handleSubTestClick: ', this.subTestName);
}

@wire(getDistinctSubTests, { TestName: '$testName'})
wiredSubTests({ error, data }) {
    if (data) {
        this.subTests = data;
        this.error = undefined;
        console.log('==>Selector getDistinctSubTests: ', this.subTests);

    } else if (error) {
        this.error = error;
        this.subTests = undefined;
    }
}

  

}