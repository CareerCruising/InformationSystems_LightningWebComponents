public class Describer
{

// Intialize objectNames and fields
public void Snippit() {
    Map <String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
    Map <String, Schema.SObjectField> fieldMap = schemaMap.get('Opportunity').getDescribe().fields.getMap();

    for(Schema.SObjectField x : fieldMap.Values())
    {
        schema.DescribeFieldResult CurrentField = x.getDescribe();
        system.debug(CurrentField);
    }
}

}