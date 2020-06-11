/**
 * Created by Rick on 3/14/2018.
 */
({
	hlpDoInit : function(component) {
        try
        {
			component.set("v.modalClassName", "slds-modal slds-modal--large slds-fade-in-open");
			component.set("v.backdropClassName", "slds-backdrop slds-backdrop--open");
        	this.showSpinner(component);

            var action = component.get("c.ctrlFetchAccountFromOpp");
            //action.setParams({ "oppId" : component.get("v.recordId")});

            action.setParams({ "oppId" : component.get("v.recordId")});

            action.setCallback(this, function(response){
                if(!this.handleResponse(component, response))
                {
                    this.hideSpinner(component);
                    return;
                }
                var existingAccount= response.getReturnValue();
                component.set("v.existingAccount", existingAccount);
                //console.log('existingSystem = ' + JSON.stringify(existingSystem));
                if(existingAccount)
                {
                	component.set("v.existingAccountName", existingAccount.Name);
                }
                else
                {
                    //console.log('hlpDoInit-v.allowCreate = ' + JSON.stringify(component.get("v.allowCreate")));
                    component.set("v.existingAccount", 'Error: no existing account');
                }
                this.hideSpinner(component);

            });
             $A.enqueueAction(action);

        }
        catch(e)
        {
            this.showError(component, 'hlpDoInit - ' + e.message);
        }
	},

	hlpSave : function(component) {
        try
        {

        	console.log('saving in hlpSave for newAccountid: ' + component.get("v.newAccountId") );
        	this.showSpinner(component);

            var action = component.get("c.ctrlSave");
            action.setParams({ "accountId" : component.get("v.newAccountId")});

            action.setParams({
                "oppId": component.get("v.recordId"),
                "accountId" : component.get("v.newAccountId")
	        });

            console.log('setting method');

             action.setCallback(this, function(response){
                 if(!this.handleResponse(component, response))
                 {
                     this.hideSpinner(component);

                     return;
                 }
                 var calloutResult = response.getReturnValue();
                 

                 console.log('calloutResult = ' + JSON.stringify(calloutResult));
                 if (calloutResult.result) {
                     this.showSuccess(component, calloutResult.message);
                         $A.get('e.force:refreshView').fire();
                 }
                 else {
                     this.showError(component, calloutResult.message);
                 }

                $A.get('e.force:closeQuickAction').fire();

                 this.hideSpinner(component);


             });
              $A.enqueueAction(action);

         }
         catch(e)
         {
             this.showError(component, 'hlpSave - ' + e.message);
         }
 	},

    hlpCloseModal : function(component) {
        $A.get("e.force:closeQuickAction").fire();
    },

    handleResponse : function(component, response) {
        try
        {
            var state = response.getState();
            if (state !== "SUCCESS")
            {
                var unknownError = true;
                if(state === 'ERROR')
                {
                    var errors = response.getError();
                    if (errors)
                    {
                        if (errors[0] && errors[0].message)
                        {
                            unknownError = false;
                            this.showError(component, errors[0].message);
                        }
                    }
                }
                if(unknownError)
                {
                    this.showError(component, 'Unknown error from Apex class');
                }
                return false;
            }
            return true;
        }
        catch(e)
        {
            this.showError(component, e.message);
            return false;
        }
    },

	showError : function(component, message)
	{
	    var toastEvent = $A.get("e.force:showToast");
	    toastEvent.setParams({
	        "type": "Error",
	        "mode": "sticky",
	        "message": message
	    });
	    toastEvent.fire();
	},

    showSuccess : function(component, message)
    {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "type": "success",
            //"mode": "sticky",
            "message": message
        });
        toastEvent.fire();
    },

    showSpinner : function(component) {
        var spinner = component.find("mySpinner");
        $A.util.removeClass(spinner, "slds-hide");
    },

    hideSpinner : function(component) {
        var spinner = component.find("mySpinner");
        $A.util.addClass(spinner, "slds-hide");
    },
})