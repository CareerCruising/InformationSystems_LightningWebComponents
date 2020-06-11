({
    hlpDoInit: function (component)
    {

        try
        {
            this.showSpinner(component);
            component.set("v.mode", 'List');
            var action = component.get('c.ctrlFetchLines');
            action.setParams({
                                 'opportunityId': component.get("v.recordId")
                             });

            action.setCallback(this, function (response)
            {
                if(!this.handleResponse(component, response))
                {
                    this.hideSpinner(component);
                    return;
                }

                var resp = response.getReturnValue();
                this.hlpProcessData(component, resp);
                this.hideSpinner(component);
            });

            $A.enqueueAction(action);
        }
        catch (e)
        {
            this.showError(component, 'CmpOpportunityLineTable hlpDoInit - ' + e.message);
        }
    },

    hlpSave: function (component, lstUpdateRecords)
    {

        try
        {
            this.showSpinner(component);
            var action = component.get('c.ctrlSave');

            action.setParams({
                                 'opportunityId': component.get("v.recordId"),
                                 'lstUpdateRecords': lstUpdateRecords
                             });

            action.setCallback(this, function (response)
            {
                if(!this.handleResponse(component, response))
                {
                    this.hideSpinner(component);
                    return;
                }

                var resp = response.getReturnValue();
                this.hlpProcessData(component, resp);
                this.hideSpinner(component);
            });

            $A.enqueueAction(action);
        }
        catch (e)
        {
            this.showError(component, 'CmpOpportunityLineTable hlpSave - ' + e.message);
        }
    },

    hlpDeleteRecord: function (component, row)
    {

        try
        {
            this.showSpinner(component);
            var action = component.get('c.ctrlDeleteRecord');

            action.setParams({
                                 'opportunityId': component.get("v.recordId"),
                                 'recordId': row.Id
                             });

            action.setCallback(this, function (response)
            {
                if(!this.handleResponse(component, response))
                {
                    this.hideSpinner(component);
                    return;
                }
                this.showSuccess(component, 'Deleted Successfully');
                var resp = response.getReturnValue();
                this.hlpProcessData(component, resp);
                this.hideSpinner(component);
            });

            $A.enqueueAction(action);
        }
        catch (e)
        {
            this.showError(component, 'CmpOpportunityLineTable hlpDeleteRecord - ' + e.message);
        }
    },


    hlpHandleSaveSuccess: function (component, resp)
    {

        try
        {
            this.showSuccess(component, 'Saved Successfully');
            this.hlpDoInit(component);
        }
        catch (e)
        {
            this.showError(component, 'CmpOpportunityLineTable hlpHandleSaveSuccess - ' + e.message);
        }
    },

    hlpProcessData: function (component, resp)
    {

        try
        {
            var data = resp.lstOLI;
            for(var i = 0; i < data.length; i++)
            {
                var row = data[i];
                row.ProductName = data[i].Product2.Name;
            }
            component.set("v.data", data);
            component.set("v.lstColumn", resp.lstColumn);
        }
        catch (e)
        {
            this.showError(component, 'CmpOpportunityLineTable hlpProcessData - ' + e.message);
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