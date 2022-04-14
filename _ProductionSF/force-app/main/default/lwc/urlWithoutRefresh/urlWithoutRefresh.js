import { LightningElement, track } from 'lwc';


export default class UrlWithoutRefresh extends LightningElement {
    @track UrlOrRecordId = '';
    @track PageUrl = '';

    

    handleInputChange(event) {
        console.log(event.target.value);
        var NewString = event.target.value;
        if(NewString == null || NewString == '') return;
        if(NewString.indexOf("/") >= 0) this.PageUrl = NewString;
        if(NewString.indexOf("/") == -1) {
            this.PageUrl = '/lightning/r/' + NewString + '/view';
        }
        //onsole.log(this.PageUrl);
    }

    SelectAll(event) {
        console.log(event);
        event.target.focus();
        event.target.select();
    }


}