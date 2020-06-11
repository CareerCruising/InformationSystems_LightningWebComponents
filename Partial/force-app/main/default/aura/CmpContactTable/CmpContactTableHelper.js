({
    hlpDoInit: function (component)
    {

        try
        {
            this.showSpinner(component);
            component.set("v.mode", 'List');
            var action = component.get('c.ctrlFetchContacts');
            action.setParams({
                                 'accountId': component.get("v.recordId")
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
            this.showError(component, 'CmpContactTable hlpDoInit - ' + e.message);
        }
    },

    hlpSetTitle: function (component)
    {
        try
        {
            var mode = component.get("v.mode");
            if(mode == 'Edit')
            {
                component.set("v.modalTitle", 'Edit Contact');
            }
            else
            {
                component.set("v.modalTitle", 'Manage Contacts');
            }
        }
        catch (e)
        {
            this.showError(component, 'CmpContactTable hlpSetTitle - ' + e.message);
        }
    },

    hlpAdd: function (component)
    {
        try
        {
            var createRecordEvent = $A.get("e.force:createRecord");
            createRecordEvent.setParams({
                                                   "entityApiName": "Contact",
                                                   "defaultFieldValues": {
                                                       'AccountId' : component.get("v.recordId")
                                                   }
                                               });
            createRecordEvent.fire();
        }
        catch (e)
        {
            this.showError(component, 'CmpContactTable hlpAdd - ' + e.message);
        }
    },


    hlpSave: function (component, lstUpdateRecords)
    {

        try
        {
            this.showSpinner(component);
            var action = component.get('c.ctrlSave');

            action.setParams({
                                 'accountId': component.get("v.recordId"),
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
                this.showSuccess(component, 'Saved Successfully');
            });

            $A.enqueueAction(action);
        }
        catch (e)
        {
            this.showError(component, 'CmpContactTable hlpSave - ' + e.message);
        }
    },

    hlpDeleteRecord: function (component, row)
    {

        try
        {
            this.showSpinner(component);
            var action = component.get('c.ctrlDeleteRecord');

            action.setParams({
                                 'accountId': component.get("v.recordId"),
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
            this.showError(component, 'CmpContactTable hlpDeleteRecord - ' + e.message);
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
            this.showError(component, 'CmpContactTable hlpHandleSaveSuccess - ' + e.message);
        }
    },

    hlpProcessData: function (component, resp)
    {

        try
        {
            var data = resp.lstContact;
            component.set("v.data", data);
            component.set("v.lstColumn", resp.lstColumn);
        }
        catch (e)
        {
            this.showError(component, 'CmpContactTable hlpProcessData - ' + e.message);
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