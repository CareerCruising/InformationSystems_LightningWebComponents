public class Describe
{
    @AuraEnabled
    public static List<object> SalesforceObject(string SfObjectName) {
        Map <String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
        Map <String, Schema.SObjectField> fieldMap = schemaMap.get(SfObjectName).getDescribe().fields.getMap();
        List<object> ObjectFields = new List<object>();

        //System.debug(JSON.serializePretty(fieldMap.Values()));

        for(Schema.SObjectField x : fieldMap.Values())
        {
            schema.DescribeFieldResult CurrentField = x.getDescribe();
            ObjectFields.add(JSON.serialize(CurrentField)); 
        }

        return (ObjectFields);
    }
    
    @AuraEnabled
    public static List<object> ObjectList() {
        List<object> Objects = Database.query('SELECT SObjectType FROM ObjectPermissions GROUP BY SObjectType ORDER BY SObjectType ASC');
        return (Objects);
    }    

    @AuraEnabled
    public static String getAccountIdFromRecordId(Id strRecordId)
    {
        String ObjectName = String.valueOf(strRecordId.getSobjectType());
        String AccountIdField = 'AccountId';
        switch on ObjectName {
           when 'Account' {
               return String.valueOf(strRecordId);
           }
           when 'Opportunity','Contact','Asset','Case' {
               AccountIdField = 'AccountId';
           }
           when 'System__c' {
               AccountIdField = 'Account__c';
           }        
           when else {
               return 'No Account Reference';
           }
        }
        
        sObject AnyObj;
        try {
            AnyObj = Database.query('Select ' + AccountIdField + ' From ' + ObjectName + ' Where Id = :strRecordId LIMIT 1');
        } catch(Exception e) {
            return 'No Account Reference';
        }  
        return String.valueOf(AnyObj.get(AccountIdField));
    }  

}