import { LightningElement, wire } from 'lwc';
import  getDistinctSubTests  from '@salesforce/apex/UnitTestController.getDistinctSubTests';
import  getSubTestResultList  from '@salesforce/apex/UnitTestController.getSubTestResultList';

export default class TestSelector extends LightningElement {

testName;
subTestName;
subTests;
subTestResults;
error;
columns;
jsondata;

handleTestClick(evt) {
    this.testName = evt.detail;
    //console.log('==>Selector test chosen: ', evt.detail);
    console.log('==>Selector handle test: ', this.testName);

}

handleSubTestClick(evt) {
    this.subTestName = evt.detail;
    //console.log('==>Selector test chosen: ', evt.detail);
    console.log('==>Selector handle subtest: ', this.subTestName);

}

@wire(getDistinctSubTests, { TestName: '$testName'})
wiredSubTests({ error, data }) {
    if (data) {
        this.subTests = data;
        this.error = undefined;
        console.log('==>Selector subTests: ', this.subTests);

    } else if (error) {
        this.error = error;
        this.subTests = undefined;
    }
}
  

@wire(getSubTestResultList, { SubTest: '$subTestName'})
wiredSubTestResults({ error, data }) {
    if (data) {
        this.subTestResults = data;
        this.error = undefined;
        //console.log('==>Selector subTest results: ', this.subTestResults[0].Json__c);
        this.jsondata = this.subTestResults[0].Json__c;
        this.columns = this.subTestResults[0].Columns__c;
        console.log('==>Selector data: ', data);
        console.log('==>Selector subTestresults jsondata: ', this.jsondata);
        console.log('==>Selector subTestresults columns: ', this.columns);
    } else if (error) {
        this.error = error;
        this.subTests = undefined;
    }
}
  

}