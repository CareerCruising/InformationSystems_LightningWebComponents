import { LightningElement, api, track, wire } from 'lwc';
import  getSubTestResultList  from '@salesforce/apex/UnitTestController.getSubTestResultList';
import  getSubTestResultColumns from '@salesforce/apex/UnitTestController.getSubTestResultColumns';

export default class TestSubTestDetailList extends LightningElement {

//j2 = [{App :"CC1",NetWorkName :"Inspire Billings",InspireNetworkId :"61"}]

  @track jsondata;
  @track cols;

  // Private var to track @api subTestName
  _subTestName = undefined;

  // Use set and get to process the value every time it's
  // requested while switching between subtests
  set subTestName(value) {
      this._subTestName = value;
  }
  
  // getter for productId
  @api get subTestName(){
      return this._subTestName;
  }

    
 @wire(getSubTestResultList, { SubTest: '$subTestName'})
    wiredSubTestResults({ error, data }) {
    if (data) {
        this.jsondata = data;
        this.error = undefined;
        console.log('==>jsondata ', this.jsondata);
 
    } else if (error) {
        this.error2 = error;
        this.jsondata = undefined;
    }
}

@wire(getSubTestResultColumns, { SubTest: '$subTestName'})
    wiredSubTestResultCols({ error, data }) {
    if (data) {
        this.cols = data;
        this.error = undefined;
        console.log('==>cols ', this.cols);
 
    } else if (error) {
        this.error = error;
        this.cols = undefined;
    }
}


}