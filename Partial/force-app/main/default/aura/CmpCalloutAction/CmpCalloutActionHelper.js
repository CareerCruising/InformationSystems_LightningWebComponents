/**
 * Created by brendafinn on 2019-03-22.
 */
({
    hlpInit : function(component, event) {
        var action = component.get('c.sendMessage');
        var actionParams = {
            recordId : component.get('v.recordId'),
            sObjectName : component.get('v.sObjectName'),
            calloutName : component.get('v.calloutName')
        };

        var cb = function(component, result) {
            console.log('=====> cb result = %O' ,result);
            var isSuccess = result.success;
            var message = result.message;
            var detail = result.detail;
            var status = result.status;
            var spinner = component.find("mySpinner");

            console.log('====> isSuccess = ' + isSuccess + ', status = ' + status );
            component.find('notifLib').showToast({
                "variant": status,
                "title": message,
                "message": detail != null ? detail : '',
                "mode": "pester"
            });
            $A.util.toggleClass(spinner, "slds-hide");
            var dismissActionPanel = $A.get("e.force:closeQuickAction");
            dismissActionPanel.fire();
            
            $A.get('e.force:refreshView').fire();
        };

        console.log('=====> making callout with params = %O', actionParams);
        component.call(action, actionParams, cb);
    }
})