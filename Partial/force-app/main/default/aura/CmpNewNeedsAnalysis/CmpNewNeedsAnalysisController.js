({
    init : function(component, event, helper) {
        component.set('v.blnInitDone',false);
        component.set('v.blnRecordCreated', false);
        var action = component.get("c.getRecordTypeIds");
        var onsuccess = function (component, result) {
            component.set('v.blnInitDone', true);
            console.log('=====> cb result = %O', result);
            var isSuccess = result.success;
            if (isSuccess === false) {
                console.error('====> callout was unsuccessful. result = ' + JSON.stringify(result));
                $A.get('e.force:closeQuickAction').fire();
                component.error('There was an error creating New Needs Analysis record : ' + JSON.stringify(result));
                return;
            }
            var rtIdMapJSON = result.rtIdMapJSON;
            component.set('v.mapRtIds', rtIdMapJSON);
            component.set('v.blnInitDone', true);
        };
        component.call({
            serverAction: action,
            params: {},
            successcb: onsuccess});
    },

    createNewNARecord : function(component, event, helper) {
        if (component.get('v.blnRecordCreated') || !component.get('v.blnInitDone')) {
            console.log('=====> returning now - not ready to create new record.');
            return;
        }
        if (component.get('v.sObjectName') === 'Account') {
            component.createNewForAcc();
        } else { // opportunity
            component.createNewForOpp();
        }
    },
    createNewForOpp : function(component, event, helper) {
        var oppWithFields = component.get('v.oppWithFields');
        if(oppWithFields == null) return;
        console.log('oppWithFields = ' + JSON.stringify(oppWithFields));
        if(oppWithFields.Needs_Analysis__c){
            console.log('null');
            component.warn('A Needs Analysis record has already been created for this Opportunity. You can access it from the Needs Analysis field within the Details section.');
            $A.get('e.force:closeQuickAction').fire();
            return;
        }

        component.find('newNA').getNewRecord(
            'Needs_Analysis__c',
            null, false,
            $A.getCallback(function(){
                var na = component.get('v.naWithFields')
                na.Account__c = oppWithFields.AccountId;
                na.From_Opp__c = component.get('v.recordId');
                var mapRtIds = JSON.parse(component.get('v.mapRtIds'));
                // if we cant find a matching record type with same name for New Needs Analysis, then default to Xello
                na.RecordTypeId = mapRtIds.Xello;
                if (mapRtIds[oppWithFields.Account.RecordType.DeveloperName] !== undefined) {
                    na.RecordTypeId =  mapRtIds[oppWithFields.Account.RecordType.DeveloperName];
                }
                component.set('v.naWithFields', na);
                console.log(JSON.stringify(na));
                if(!na){
                    console.error('Did not init NA');
                    return;
                }
                component.createNewRecord();
            })
        );
    },

    createNewForAcc : function(component, event, helper) {
        var accWithFields = component.get('v.accWithFields');
        if(accWithFields == null) return;
        console.log('createNewForAcc accWithFields = ' + JSON.stringify(accWithFields));
        if(accWithFields.Primary_Needs_Analysis__c){
            component.warn('A Needs Analysis record has already been created for this account. You can access it from the Primary Needs Analysis field within the Details section.');
            $A.get('e.force:closeQuickAction').fire();
            return;
        }

        component.find('newNA').getNewRecord(
            'Needs_Analysis__c',
            null, false,
            $A.getCallback(function () {
                console.log('=====> callback for getNewRecord');

                var na = component.get('v.naWithFields');
                na.Account__c = component.get('v.recordId');
                var mapRtIds = JSON.parse(component.get('v.mapRtIds'));
                console.log('====> mapRtIds = %o', mapRtIds);
                // if we cant find a matching record type with same name for New Needs Analysis, then default to Xello
                if (mapRtIds[accWithFields.RecordType.DeveloperName] === undefined) {
                    na.RecordTypeId = mapRtIds.Xello;
                } else {
                    na.RecordTypeId =  mapRtIds[accWithFields.RecordType.DeveloperName];
                }

                component.set('v.naWithFields', na);
                console.log(JSON.stringify(na));
                if (!na) {
                    console.error('createNewForAcc Did not init NA');
                    return;
                }
                component.createNewRecord();
            })
        );
    },
    createNewRecord : function(component, event, helper){
        $A.util.removeClass(component.find('spinner'),'slds-hide')
        var workspace = component.find('workspace');
        var isConsole = false;
        workspace.isConsoleNavigation().then(function(response){
            isConsole = response;
        }).catch(function(ex){
            console.error(ex);
            component.error('Exception: ' + JSON.stringify(ex));
            return;
        });
        component.find('newNA').saveRecord(function(result){
            $A.util.addClass(component.find('spinner'),'slds-hide')

            $A.get('e.force:closeQuickAction').fire();
            if (component.successfulResponse(result)) {
                // record is saved successfully
                var resultsToast = $A.get("e.force:showToast");
                resultsToast.setParams({
                                           "title": "Saved",
                                           "type" : "success",
                                           "message": "The record was saved."
                                       });
                resultsToast.fire();

                if(isConsole === true){
                    workspace.getFocusedTabInfo().then(function(tabInfo){
                        workspace.openSubtab({
                                                 parentTabId : tabInfo.tabId,
                                                 pageReference: {
                                                     type: "standard__recordPage",
                                                     attributes: {
                                                         "recordId": result.recordId,
                                                         "actionName":"view"
                                                     },
                                                     state: {}
                                                 },
                                                 focus : true
                                             }).catch(function(e){
                            component.notify(e, 'CmpNewNeedsAnalysis')
                        })
                    }).catch(function(e){
                        component.notify(e, 'CmpNewNeedsAnalysis')
                    })
                }
                else{
                    var view = $A.get('e.force:navigateToSObject');
                    view.setParams({
                                       recordId : result.recordId
                                   });
                    view.fire();
                }

            }
            else{
                console.log(JSON.stringify(result));
                component.error('An unexcepted error has occurred');
            }
        })
    }
})