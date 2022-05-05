import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

export default class PartnerReports extends NavigationMixin(LightningElement) {
    @api recordId;
    account;
    name;

    @wire(getRecord, { recordId: '$recordId', fields: [
        'Account.Name'
        ,'Account.Type'
    ] })
    wiredRecord({ error, data }) {

        if ( error ) {

            let message = 'Unknown error';
            if (Array.isArray(error.body)) {
                message = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                message = error.body.message;
            }
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading account',
                    message,
                    variant: 'error',
                }),
            );

        } else if ( data ) {

            this.account = data;
            console.log( 'Contact is ' + JSON.stringify( this.account ) );
            this.name = this.account.fields.Name.value;

        }
    }

    OpenURL(event) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: '00O1K000009r67NUAQ',
                objectApiName: 'Report',
                actionName: 'view'
            },
            state : {
                fv3: this.name
            }
        });        
    }

}