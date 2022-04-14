import { LightningElement, api, wire, track } from "lwc";
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import { NavigationMixin } from 'lightning/navigation';
import CopyOpp from'@salesforce/apex/QuickUtils.CopyOpp';


export default class OppCopy extends NavigationMixin(LightningElement) {

    @api recordId;
    @track ShowToast = false;
    isExecuting = false; //stops people from double clicking the button, only runs code once

    @api async invoke() {
        if (this.isExecuting) {
            return;
        }
        this.isExecuting = true;
        this.ShowToast = true;

        CopyOpp({SourceOppId: this.recordId, IsTest: false})
            .then(result => {
                var data = JSON.parse(result);
                console.log('data', data);

                if(data.Id != null && data.Id != '') {
                    this.ShowToast = false;
                    this[NavigationMixin.Navigate]({
                        type: 'standard__recordPage',
                        attributes: {
                            recordId: data.Id,
                            actionName: 'view',
                        },
                    });
                }

                if(data.Error != null) {
                    this.ShowToast = false;
                    const event = new ShowToastEvent({
                        title: 'Copy Opportunity (Failed)',
                        message: data.Error,
                        mode: 'sticky',
                        variant: 'warning',
                    });
                    this.dispatchEvent(event);
                }

                
            })
            .catch(error => {
                this.ShowToast = false;
                this.error = error;
                console.log(this.error);
                const event = new ShowToastEvent({
                    title: 'Copy Opportunity (Failed)',
                    message: this.error,
                    mode: 'sticky',
                    variant: 'error',
                });
                this.dispatchEvent(event);

            });

        
        await this.sleep(3000);
        this.isExecuting = false;
    }

    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    CloseToast() { 
        this.ShowToast = false;
    }
}