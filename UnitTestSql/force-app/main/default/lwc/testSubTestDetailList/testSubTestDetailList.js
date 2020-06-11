import { LightningElement, api } from 'lwc';

export default class TestSubTestDetailList extends LightningElement {

@api 
get jsondata() {}
set jsondata(value) {
    console.log('jsondata: ', value);
}

@api 
get columns() {}
set columns(value) {
    console.log('columns: ', value);
};



}