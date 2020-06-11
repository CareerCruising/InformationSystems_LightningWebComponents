({
	hlpDoInit : function(component) {
        try
        {
            var action = component.get("c.ctrlFetchAccount");
            action.setParams({ "recordId" : component.get("v.recordId"),
        						"accountLookupFieldName" : component.get("v.accountLookupFieldName")});

            action.setCallback(this, function(response){
                if(!this.handleResponse(component, response))
                {
                    return;
                }
                var accountWrapper = response.getReturnValue();
                component.set("v.accountWrapper", accountWrapper);
                // console.log('accountWrapper.a = ' + JSON.stringify(accountWrapper.a));

            });
             $A.enqueueAction(action);

        }
        catch(e)
        {
            this.showError(component, 'hlpDoInit - ' + e.message);
        }
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


})