import { LightningElement, api, wire, track } from "lwc";
import { NavigationMixin } from 'lightning/navigation';
import SendEmail from'@salesforce/apex/Email.sendEmail';
import { CloseActionScreenEvent } from 'lightning/actions';

export default class CallOutOppCopy extends NavigationMixin(LightningElement) {
    @api recordId;
    @track ActionPanel = {
        Spinner: true,
        Alert: false,
        Message: 'Please wait, this could take up to a minute...'
    };

    connectedCallback() {
        //HACK - this.recordId will be undefined unless I wait a few milliseconds. Something to do with lifecycle hooks.
        setTimeout(() => {
            this.callCreateRenewal();
        }, 30);        
    }

    callCreateRenewal() {
        // Use standard Fetch API 
        fetch('https://is.xello.world/api/Integrations/OpportunityCopy?OppId=' + this.recordId).then((response) => response.json())
            .then((jsonResponse) => {
                console.log('jsonResponse',jsonResponse);
                if(jsonResponse.Result == null && jsonResponse.MessageDetail != null) {
                    this.ActionPanelMessage = jsonResponse.Message;
                    return;
                }
                var data = jsonResponse.Result;
                if(data.Success) {
                    this.dispatchEvent(new CloseActionScreenEvent());
                    this[NavigationMixin.Navigate]({
                        type: 'standard__recordPage',
                        attributes: {
                            recordId: data.Detail,
                            actionName: 'view',
                        },
                    });      
                } else {
                    this.ActionPanel.Message = data.Message + ': ' + data.Detail;   
                    this.ActionPanel.Spinner = false;
                    this.ActionPanel.Alert = true;
                    SendEmail({toAddress: ['anthonya@xello.world'], subject: 'callOutOppCopy Issue (OppSource: ' + this.recordId + ')', body: this.ActionPanel.Message})
                }   
            })       
            .catch((error) => {
                console.log(error);
                this.ActionPanel.Message = error;  
                SendEmail({toAddress: ['anthonya@xello.world'], subject: 'callOutOppCopy Issue (OppSource: ' + this.recordId + ')', body: error})
            });
    }

}

