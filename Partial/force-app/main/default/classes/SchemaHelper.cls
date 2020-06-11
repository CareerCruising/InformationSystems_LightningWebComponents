/* Class:       SchemaHelper
 * Created On:  06/01/2017
 * Created by:  Veena Sundara-Heragu (OpFocus, Inc)
 * Description: Utility methods to get information about Salesforce objects and fields
 */
 
public class SchemaHelper {

    public static Boolean canSee(Schema.SObjectField f){
        if(ignorePermissions)return true;
        return f.getDescribe().isAccessible();
    }
    public static Boolean canUpdate(Schema.SObjectField f){
        if(ignorePermissions)return true;
        return f.getDescribe().isUpdateable();
    }
    public static Boolean canSort(Schema.SObjectField f){
        return f.getDescribe().isSortable();
    }
    public static Boolean canFilter(Schema.SObjectField f){
        return f.getDescribe().isFilterable();
    }
    public static Boolean canGroup(Schema.SObjectField f){
        return f.getDescribe().isGroupable();
    }

    public static Boolean ignorePermissions = false;

    private static Map<String,Map<String,Schema.RecordTypeInfo>> recordTypes = new Map<String,Map<String,Schema.RecordTypeInfo>>();

    public static Id getRecordType(String obj, String name){
        if(recordTypes.get(obj) != null){
            if(recordTypes.get(obj).get(name) != null){
                return recordTypes.get(obj).get(name).getRecordTypeId();
            }
        }
        if(recordTypes.get(obj) == null){
            recordTypes.put(obj,new Map<String,Schema.RecordTypeInfo>());
        }
        Schema.RecordTypeInfo result = Schema.getGlobalDescribe().get(obj).getDescribe().getRecordTypeInfosByName().get(name);
        if(!result.isAvailable() && !ignorePermissions){
            throw new SchemaException('You do not have access to record type, ' + obj + '.' + name);
            return null;
        }
        //ignorePermissions = false;
        recordTypes.get(obj).put(name,result);
        return result.getRecordTypeId();
    }

    public static String getSObjectFields(String objName){
        List<String> lstFields = new List<String>();
        Map<String,Schema.SObjectField> mapFields = Schema.getGlobalDescribe().get(objName).getDescribe().fields.getMap();
        for(String fapi : mapFields.keySet()){
            if(canSee(mapFields.get(fapi))){
                lstFields.add(fapi);
            }
        }
        ignorePermissions = false;
        return String.join(lstFields,',');
    }

    public static String getSObjectFieldsNoPermission(String objName){
        ignorePermissions = true;
        return getSObjectFields(objName);
    }

    public static String getRelationshipSObjectFields(String objName, String relName){
        List<String> lstFields = new List<String>();
        Map<String,Schema.SObjectField> mapFields = Schema.getGlobalDescribe().get(objName).getDescribe().fields.getMap();
        for(String fapi : mapFields.keySet()){
            if(canSee(mapFields.get(fapi))){
                lstFields.add(relName + '.' + fapi);
            }
        }
        ignorePermissions = false;
        return String.join(lstFields,',');
    }

    public static String getRelationshipSObjectFieldsNoPermission(String objName, String relName){
        ignorePermissions = true;
        return getRelationshipSObjectFields(objName, relName);
    }

    public static Map<String,String> getPicklistValues(String objName, String fieldName){
        Map<String,String> lstReturn = new Map<String,String>();
        Schema.SObjectField field = Schema.getGlobalDescribe().get(objName).getDescribe().fields.getMap().get(fieldName);
        if(!canSee(field)){
            return lstReturn;
        }
        List<Schema.PicklistEntry> lstPle = field.getDescribe().getPicklistValues();

        for(Schema.PicklistEntry ple :lstPle){
            lstReturn.put(ple.getValue(),ple.getLabel());
        }
        return lstReturn;
    }
    public static SelectOption[] getSOPicklistValues(String objName, String fieldName){
        List<SelectOption> lstReturn = new List<SelectOption>();
        Schema.SObjectField field = Schema.getGlobalDescribe().get(objName).getDescribe().fields.getMap().get(fieldName);
        if(!canSee(field)){
            return lstReturn;
        }
        List<Schema.PicklistEntry> lstPle = field.getDescribe().getPicklistValues();

        for(Schema.PicklistEntry ple :lstPle){
            lstReturn.add(new SelectOption(ple.getValue(),ple.getLabel()));
        }
        return lstReturn;
    }

    public static Map<String,Schema.SObjectField> getFieldsByName(String objName, Set<String> fieldNames){
        Map<String,Schema.SObjectField> mapReturn = new Map<String,Schema.SObjectField>();
        Map<String,Schema.SObjectField> mapFields = Schema.getGlobalDescribe().get(objName).getDescribe().fields.getMap();
        for(String f :fieldNames){
            if(canSee(mapFields.get(f))){
                mapReturn.put(f,mapFields.get(f));
            }
        }
        ignorePermissions = false;
        return mapReturn;
    }
    public static Map<String,Schema.SObjectField> getFieldsByName(String objName, List<String> fieldNames){
        return getFieldsByName(objName, new Set<String>(fieldNames));
    }

    public static Set<Schema.SObjectField> getSetFieldsByNames(String objName, List<String> fieldNames){
        return new Set<Schema.SObjectField>(getFieldsByName(objName, new Set<String>(fieldNames)).values());
    }

    public static Set<Schema.SObjectField> getSetFieldsByNames(String objName, Set<String> fieldNames){
        return new Set<Schema.SObjectField>(getFieldsByName(objName, fieldNames).values());
    }

    public static Map<String,Schema.SObjectField> getFieldsByNameNoPermission(String objName, Set<String> fieldNames){
        ignorePermissions = true;
        return getFieldsByName(objName, fieldNames);
    }
    public static Map<String,Schema.SObjectField> getFieldsByNameNoPermission(String objName, List<String> fieldNames){
        ignorePermissions = true;
        return getFieldsByName(objName, new Set<String>(fieldNames));
    }

    public static Set<Schema.SObjectField> getSetFieldsByNamesNoPermission(String objName, List<String> fieldNames){
        ignorePermissions = true;
        return new Set<Schema.SObjectField>(getFieldsByName(objName, new Set<String>(fieldNames)).values());
    }

    public static Set<Schema.SObjectField> getSetFieldsByNamesNoPermission(String objName, Set<String> fieldNames){
        ignorePermissions = true;
        return new Set<Schema.SObjectField>(getFieldsByName(objName, fieldNames).values());
    }

    public static Set<Schema.SObjectField> getSetFieldsByObject(String objName){
        Set<Schema.SObjectField> setReturn = new Set<Schema.SObjectField>();
        Map<String,Schema.SObjectField> mapFields = Schema.getGlobalDescribe().get(objName).getDescribe().fields.getMap();
        for(Schema.SObjectField f :mapFields.values()){
            if(canSee(f)){
                setReturn.add(f);
            }
        }
        return setReturn;
    }

    public class SchemaException extends Exception{}
}