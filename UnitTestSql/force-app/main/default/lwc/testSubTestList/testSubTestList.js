import { LightningElement, api } from 'lwc';

export default class TestSubTestList extends LightningElement {

    @api subTests;

    subTestClick(event) {
        console.log('subTestClick ==> : ',event.target.dataset.key);
        const selectEvent = new CustomEvent('subtestclick', {
            detail: event.target.dataset.key
        });
        // 3. Fire the custom event
        this.dispatchEvent(selectEvent);
    }


}