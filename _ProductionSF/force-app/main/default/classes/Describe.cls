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
            // if(CurrentField.name == 'Name' || CurrentField.name == 'Id'){
            //     ObjectFields.add(JSON.serialize(CurrentField)); 
            // }
            ObjectFields.add(JSON.serialize(CurrentField)); 
        }

        return (ObjectFields);
    }
}