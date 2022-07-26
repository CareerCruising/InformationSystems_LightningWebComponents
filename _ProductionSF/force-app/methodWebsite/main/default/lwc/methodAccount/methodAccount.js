import { LightningElement } from 'lwc';

export default class MethodAccount extends LightningElement {

    connectedCallback() {  
        this.fetchData();
    }    
}