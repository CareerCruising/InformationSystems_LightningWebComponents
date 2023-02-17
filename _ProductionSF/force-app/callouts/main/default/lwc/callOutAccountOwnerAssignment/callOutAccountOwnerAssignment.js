import { LightningElement, api, track } from "lwc";
import { CloseActionScreenEvent } from 'lightning/actions';
import SendEmail from'@salesforce/apex/Email.sendEmail';

export default class CallOutAccountOwnerAssignment extends LightningElement {
    @api recordId;
    @track ActionPanel = {
        Spinner: true,
        Alert: false,
        Message: 'Please wait...'
    };

    connectedCallback() {
        //HACK - this.recordId will be undefined unless I wait a few milliseconds. Something to do with lifecycle hooks.
        setTimeout(() => {
            this.callRebuildAccountOwnership();
        }, 30);        
    }

    callRebuildAccountOwnership() {
        // Use standard Fetch API 
        fetch('https://is.xello.world/api/Integrations/RebuildAccountOwnership?AccId=' + this.recordId).then((response) => response.json())
            .then((jsonResponse) => {
                console.log('jsonResponse',jsonResponse);
                if(jsonResponse.result == null && jsonResponse.MessageDetail != null) {
                    this.ActionPanelMessage = jsonResponse.Message;
                    return;
                }
                var data = jsonResponse.result;
                if(data.success) {
                    this.dispatchEvent(new CloseActionScreenEvent());    
                } else {
                    this.ActionPanel.Message = data.message + ': ' + data.detail;   
                    this.ActionPanel.Spinner = false;
                    this.ActionPanel.Alert = true;
                    SendEmail({toAddress: ['anthonya@xello.world'], subject: 'RebuildAccountOwnership Issue (AccountId: ' + this.recordId + ')', body: this.ActionPanel.Message})
                }   
            })       
            .catch((error) => {
                console.log(error);
                this.ActionPanel.Message = error;  
                SendEmail({toAddress: ['anthonya@xello.world'], subject: 'RebuildAccountOwnership Issue (AccountId: ' + this.recordId + ')', body: error})
            });
    }

}