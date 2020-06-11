/**
 * Created by brendafinn on 2019-05-06.
 */
public with sharing class CmpNewNeedsAnalysisCtrl {
    @AuraEnabled
    public static Output getRecordTypeIds(String inputJSON){
        Output out = new Output();
        try{
            Map<String, Schema.RecordTypeInfo> rtInfoMap = Schema.SObjectType.Needs_Analysis__c.getRecordTypeInfosByDeveloperName();
            Map<String, Id> rtIdMap = new Map<String, Id>();
            for (String devName : rtInfoMap.keyset()) {
                rtIdMap.put(devName, rtInfoMap.get(devName).getRecordTypeId());
            }
            out.rtIdMapJSON = JSON.serialize(rtIdMap);
            System.debug('====> returning ' + out);
        }
        catch(Exception e){
            System.debug('====> ERORR '  + e.getMessage() + ' :: ' + e.getStackTraceString());
            ltngfw.Log.notify(e, 'New Needs Analysis Component');
            out.handleException(e);
        }
        return out;
    }

    public class Output extends ltngfw.AuraReturn {
        @AuraEnabled public String rtIdMapJSON;
    }

    public class Input extends ltngfw.AuraInput {
    }
}