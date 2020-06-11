/* Class:       CmpCalloutActionCtrl
** Created by:  OpFocus (Brenda Finn) on 03/22/2019
** Description: Controller for CmpCalloutAction Lightning Component responsible for submitting a
**      request to a configured endpoint for the given record and configured parameters
**
** @see CmpCalloutAction AuraDefinitionBundle
** @see Callout Configuration custom metadata type
** @see Callout Parameter Map custom metadata type
**
** Change Log
**
** 7/8/2019 - OpFocus (Jason) Applied security check prior to making callout.
*/
public with sharing class CmpCalloutActionCtrl {

    /**
     * Make call to endpoint identified by calloutName for object sObjectName
     *
     * @param recordId Id identifying record of truth that provides values for endpoint request parameters
     * @param sObjectName API Name of recordId instance
     * @param calloutName Name of Callout Endpoint -> for use in retrieving custom metadata records
     *
     * @return CalloutResults containing the status of the HTTP request.
     */
    @AuraEnabled
    public static CalloutResults sendMessage(String datajson) {
        String endpoint = '';
        CalloutRequest request = (CalloutRequest) ltngfw.AuraInput.deserialize(datajson, CalloutRequest.class);
        System.debug('=====> datajson = ' + datajson + ', request = ' + request);
        try {
            Callout_Configuration__mdt calloutConfig;

            if (Test.isRunningTest()) {
                if (testCalloutConfig != null) {
                    calloutConfig = testCalloutConfig;
                } else {
                    return new CalloutResults(false, 'No Callout Configured ' +
                            (request.calloutName == null ? '' : ' for ' + request.calloutName) +
                            (request.sObjectName == null ? '' : ' on Object ' + request.sObjectName), 'error');
                }
            } else {
                // if we do not have any active callouts configured then return empty list now
                List<Callout_Configuration__mdt> calloutConfigs = [select Id, DeveloperName, Endpoint__c, Object_Name__c,
                        ObjectPermission__c
                    from Callout_Configuration__mdt
                    where
                    Is_Active__c=true and
                    DeveloperName=:request.calloutName and
                    Object_Name__c=:request.sObjectName];
                if (calloutConfigs.isEmpty()) {
                    return new CalloutResults(false, 'No Callout Configured ' +
                            (request.calloutName == null ? '' : ' for ' + request.calloutName) +
                            (request.sObjectName == null ? '' : ' on Object ' + request.sObjectName), 'error');
                }
                calloutConfig = calloutConfigs.get(0);
            }

            Map<String, String> paramMap = new Map<String, String>();
            List<Callout_Parameter_Map__mdt> calloutParamMaps;
            if (Test.isRunningTest() && testCalloutParamMaps != null) {
                calloutParamMaps = testCalloutParamMaps;
            } else {
                calloutParamMaps =  [select Source_Field_Name__c, Parameter_Name__c
                    from Callout_Parameter_Map__mdt where Callout_Configuration__c=:calloutConfig.Id and Is_Active__c=true];
            }
            for (Callout_Parameter_Map__mdt calloutParamMap : calloutParamMaps) {
                paramMap.put(calloutParamMap.Parameter_Name__c, calloutParamMap.Source_Field_Name__c);
            }
            if (paramMap.isEmpty()) {
                return new CalloutResults(false, 'Failed to find Parameter Maps for Callout Config ' + request.calloutName, 'error');
            }
            String soql = 'select ' + String.join(paramMap.values(), ',') + ' from ' + request.sObjectName + ' where Id = \'' +
                    request.recordId + '\'';
            System.debug('=======> soql = ' + soql);
            List<SObject> records = Database.query(soql);
            if (records.isEmpty()) {
                return new CalloutResults(false, 'Failed to find Record of Truth to Submit to Endpoint.', 'error');
            }

            // JAC - 2019-07-12 - Check to see if user had appropriate permission to the record of truth.
            switch on (calloutConfig.ObjectPermission__c) {

                when 'Read' {
                    if (!Schema.getGlobalDescribe().get(request.sObjectName).getDescribe().isAccessible()) {
                        return new CalloutResults(false, 'You do not have permission to perform this action.', 'error');
                    }
                }

                when 'Create' {
                    if (!Schema.getGlobalDescribe().get(request.sObjectName).getDescribe().isCreateable()) {
                        return new CalloutResults(false, 'You do not have permission to perform this action.', 'error');
                    }
                }

                when 'Edit' {
                    if (!Schema.getGlobalDescribe().get(request.sObjectName).getDescribe().isUpdateable()) {
                        return new CalloutResults(false, 'You do not have permission to perform this action.', 'error');
                    }
                }

                when 'Delete' {
                    if (!Schema.getGlobalDescribe().get(request.sObjectName).getDescribe().isDeletable()) {
                        return new CalloutResults(false, 'You do not have permission to perform this action.', 'error');
                    }
                }

                when else {
                    // Callout permission has not been set yet.  Go ahead and execute.
                }
            }


            String requestParams = '';
            for (String paramName : paramMap.keyset()) {
                requestParams += requestParams.length() == 0 ? '?' : '&';
                String value = String.valueOf(records.get(0).get(paramMap.get(paramName)));
                if (String.isEmpty(value)) {
                    continue;
                }
                requestParams += paramName + '=' + value;
            }
            endpoint = calloutConfig.Endpoint__c + requestParams;
            System.debug(LoggingLevel.INFO, '====> Making callout to Endpoint ' + endpoint);
            String responseBody = null;
            if (Test.isRunningTest()) {
                CalloutResultsJSON resultsJSON =  new CalloutResultsJSON();
                CalloutResults results = new CalloutResults();
                results.success=true;
                results.status='success';
                resultsJSON.result = results;
                responseBody = JSON.serialize(resultsJSON);
            } else {
                responseBody = AdminAppUtils.makeCallout(endpoint, request.recordId, request.sObjectName + '_' + request.calloutName);
            }
            System.debug('======> responseBody = ' + responseBody);
            CalloutResults results = ((CalloutResultsJSON)JSON.deserializeStrict(responseBody, CalloutResultsJSON.class)).result;
            results.setStatusAndColor();
            return results;
        } catch (Exception exc) {
            System.debug(LoggingLevel.ERROR, exc.getMessage() + ' :: ' + exc.getStackTraceString());
            if(request.deviceInfoStr != null) {
                ltngfw.Log.notify(exc, 'Callout Action Component', ltngfw.DeviceInformation.deserialize(request.deviceInfoStr));
            }
//            results.handleException(exc);
            return new CalloutResults(false, System.Label.Callout_Error_Message,'error');
        }
    }

    public class CalloutRequest extends ltngfw.AuraInput {
        public Id recordId;
        public String sObjectName;
        public String calloutName;

        public CalloutRequest() {}
    }

    public class CalloutResultsJSON {
        public CalloutResults result {get; set;}

        public CalloutResultsJSON() {
        }
    }
    /**
     * Object to return to Lightning Component with results of callout to configured endpoint.
     */
    public class CalloutResults extends ltngfw.AuraReturn {
        @AuraEnabled public String message {get; set;}
        @AuraEnabled public Boolean success {get; set;}
        @AuraEnabled public String detail {get; set;}
        @AuraEnabled public String status {get; set;}
        @AuraEnabled public String color {get; set;}

        /**
         * Create an empty object for use in deserializing response
         */
        public CalloutResults () {}

        /**
         * Create a Results object with res and msg
         * @param res true if callout was a success, false otherwise
         * @param msg Description of error or details from callout if successful
         * @param status Identifies status of callout - coincides with type of toast
         *      rendered to user. Values = error, success, info, warning.
         */
        public CalloutResults(Boolean res, String msg, String status) {
            this.success = res;
            this.message = msg;
            this.detail = '';
            this.status = status;
        }

        public void setStatusAndColor() {
            if (color == 'green') {
                status = 'success';
            } else if (color == 'orange') {
                status = 'warning';
            } else if (color == 'red') {
                status = 'error';
            }
        }
    }

    @TestVisible static List<Callout_Parameter_Map__mdt> testCalloutParamMaps;
    @TestVisible static Callout_Configuration__mdt testCalloutConfig;
}