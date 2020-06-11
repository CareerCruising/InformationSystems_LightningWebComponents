({
	hlpDoInit : function(component) {
        try
        {
			component.set("v.modalClassName", "slds-modal slds-modal--large slds-fade-in-open");
			component.set("v.backdropClassName", "slds-backdrop slds-backdrop--open");	
        	this.showSpinner(component);
            
            var action = component.get("c.ctrlFetchSystem");
            action.setParams({ "accountId" : component.get("v.recordId")});

            action.setCallback(this, function(response){
                if(!this.handleResponse(component, response))
                {
                    this.hideSpinner(component);
                    return;
                }
                var existingSystem = response.getReturnValue();
                component.set("v.existingSystem", existingSystem);
                //console.log('existingSystem = ' + JSON.stringify(existingSystem));
                if(existingSystem)
                {
                	component.set("v.title", 'System Details');
                }
                else
                {
                	this.checkAllowCreate(component);
                    //console.log('hlpDoInit-v.allowCreate = ' + JSON.stringify(component.get("v.allowCreate")));
                    component.set("v.title", 'Create System');	
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

    checkAllowCreate : function(component) {
        try
        {
            // ********* >> Added by R. Fleischmann
            var checkTypeAction = component.get("c.ctrlCheckAccountType");
            
            checkTypeAction.setParams({ "accountId" : component.get("v.recordId")});
            
            // can only pass a string, so must stringify an object if that's what you want.
            // --> //checkTypeAction.setParams({ "resp" : JSON.stringify(resp)});
            // then in the apex class method, you destringify it like so:
            // --> AccountWrapper aw = (AccountWrapper)JSON.deserializeStrict(respStr, AccountWrapper.Class);
            
            
            checkTypeAction.setCallback(this, function(response){
                if(!this.handleResponse(component, response))
                {
                    this.hideSpinner(component);
                    return;
                }

                var resp = response.getReturnValue();

                //console.log('resp = ' + JSON.stringify(resp));

                //Anthony Abbott Oct 2019: Removed this validation
                //if ((resp.a.Type != "School District Office" )  && (resp.profile != "System Administrator")) {

                //    var resultsToast = $A.get("e.force:showToast");
                //        resultsToast.setParams({
                //            "title": "Can't create system for this account type ",
                //            "message": resp.a.Type
                //        });
                //        resultsToast.fire();

                        // Close the action panel
                //        var dismissActionPanel = $A.get("e.force:closeQuickAction");
                //        dismissActionPanel.fire();
                //}
                //else {

                //    if (resp.a.Type != "School District Office") {
                //        component.set("v.isNotDistrict", true);
                //    }
                //    component.set("v.allowCreate", true);
                //}
                
                //Anthony Abbott Oct 2019: Replaced with this only to keep warning
                if (resp.a.Type != "School District Office") {
                    component.set("v.isNotDistrict", true);
                }
                component.set("v.allowCreate", true);
                
                //console.log('checkTypeAction-v.allowCreate = ' + JSON.stringify(component.get("v.allowCreate")));
                //console.log('checkTypeAction-v.isNotDistrict = ' + JSON.stringify(component.get("v.isNotDistrict")));
                //console.log('existingSystem = ' + JSON.stringify(component.get("v.existingSystem")));

            });

            $A.enqueueAction(checkTypeAction);

            // ********* <<Added by R. Fleischmann 

        }
        catch(e)
        {
            this.showError(component, 'hlpSave - ' + e.message);
        }
    },

	hlpSave : function(component) {
        try
        {
        	this.showSpinner(component);
        	var newSystem = component.get("v.newSystem");
        	var systemRec = {};
        	systemRec.System_ID__c = newSystem.System_ID__c;
        	systemRec.Transfer_Schedule__c = newSystem.Transfer_Schedule__c;
            var action = component.get("c.ctrlSave");
            action.setParams({ "accountId" : component.get("v.recordId"),
        						"systemStr" : JSON.stringify(systemRec)});

            action.setCallback(this, function(response){
                if(!this.handleResponse(component, response))
                {
                    this.hideSpinner(component);
                    return;
                }
                this.showSuccess(component, 'Saved Successfully');
                this.hideSpinner(component);
                //this.hlpCloseModal(component);

                // need to refresh account so don't just close the quick action, but navigate to
                // account page
                var navEvt = $A.get("e.force:navigateToSObject");
                navEvt.setParams({"recordId": component.get("v.recordId")});
                navEvt.fire();
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