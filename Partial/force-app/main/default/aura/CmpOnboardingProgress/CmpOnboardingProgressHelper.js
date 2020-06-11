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

    hlpGoToSystem : function(component) {
        try
        {
            var accountWrapper = component.get("v.accountWrapper");
            var me = this;

            // if in console, open the system record in a new subtab/primary tab 
            // Otherwise, open the system record in the current window 
            var workspaceAPI = component.find("workspace");
            workspaceAPI.isConsoleNavigation().then(function(response) 
            {
                if(response) // in console app
                {
                    me.openSystemConsoleTab(component, accountWrapper);
                }
                else
                {
                    var navEvt = $A.get("e.force:navigateToSObject");
                    navEvt.setParams({"recordId": accountWrapper.s.Id});
                    navEvt.fire();
                }
            });
        }
        catch(e)
        {
            this.showError(component, 'hlpGoToSystem - ' + e.message);
        }
    },

    openSystemConsoleTab: function(component, accountWrapper) {
        try
        {
            var workspaceAPI = component.find("workspace");
            // get current tab Info
            workspaceAPI.getFocusedTabInfo().then(function(response) {

                if(response.isSubtab) // currently in a subtab
                {
                    // open system record in a subtab of parent tab
                    workspaceAPI.openSubtab({
                        parentTabId: response.parentTabId,
                        url: '#/sObject/' + accountWrapper.s.Id + '/view',
                        focus: true
                    });

                }// subtab
                else // currently in a primary tab
                {
                    // open system record in a subtab of current tab
                    workspaceAPI.openSubtab({
                        parentTabId: response.tabId,
                        url: '#/sObject/' + accountWrapper.s.Id + '/view',
                        focus: true
                    });

                }// primary tab
            });

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

function testOpenSubtab() {
            //First find the ID of the primary tab to put the new subtab in
            sforce.console.getEnclosingPrimaryTabId(openSubtab);
        }
        
        var openSubtab = function openSubtab(result) {
            //Now that we have the primary tab ID, we can open a new subtab in it
            var primaryTabId = result.id;
            sforce.console.openSubtab(primaryTabId , 'http://www.salesforce.com', false, 
                'salesforce', null, openSuccess, 'salesforceSubtab');
        };
        
        var openSuccess = function openSuccess(result) {
            //Report whether we succeeded in opening the subtab
            if (result.success == true) {
                this.showError(component,'subtab successfully opened');
            } else {
                this.showError(component,'subtab cannot be opened');
            }
        };