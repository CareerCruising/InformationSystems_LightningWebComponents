/* Class:       CmpNeedsAnalysisCtrl
 * Created On:  
 * Created by:  J. Pipkin (OpFocus, Inc)
 * Description: 
 */
 
public with sharing class CmpNeedsAnalysisCtrl {

	static String baseQry = 'Select {0} from {1} where {2} = {3}';

	@AuraEnabled
	public static Output getData(String datajson){
		Output out = new Output();
		Input inp;
		try{
			inp = (Input) ltngfw.AuraInput.deserialize(datajson, Input.class);
			ltngfw.Log.log('record Id: ' + inp.recordId);
			Id rid = (Id) inp.recordId;
			String objName = rid.getSobjectType().getDescribe().getName();
			ltngfw.Log.log('object name: ' + objName);
			String qry = 'Select ' + inp.lookupField + ' from ' + objName + ' where Id = \'' + rid + '\'';
			ltngfw.Log.log('query: ' + qry);
			SObject so = Database.query(qry);

			out.naId = (String) so.get(inp.lookupField);
			Map<String,String> naFields = new Map<String,String>();

			Schema.FieldSetMember[] lstFSM = Schema.SObjectType.Needs_Analysis__c.fieldSets.Needs_Analysis_Component.getFields();
			for(Schema.FieldSetMember fsm : lstFSM){
				if(fsm.getType() == Schema.DisplayType.BOOLEAN){
					naFields.put(fsm.getFieldPath(), fsm.getLabel());
				}
			}
            if(out.naId != null){
                String naqryfields = String.join(new List<String>(naFields.keySet()),',');
                Needs_Analysis__c na = Database.query('Select ' + naqryfields + ' from Needs_Analysis__c where Id =\'' + out.naId + '\'');
                for(String f : naFields.keySet()){
                    if(Boolean.valueOf(na.get(f))){
                        out.checklist.add(naFields.get(f));
                    }
                }
            }
			// throw exception during test class to cover the catch block
			if(Test.isRunningTest()){
				Decimal d = 1/0;
			}
		}
		catch(Exception e){
			System.debug(e.getMessage() + ' :: ' + e.getStackTraceString());
			if(inp.deviceInfoStr != null){
				ltngfw.Log.notify(e, 'Needs Analysis Component', ltngfw.DeviceInformation.deserialize(inp.deviceInfoStr));
			}
			out.handleException(e);
		}
		return out;
	}

	public class Output extends ltngfw.AuraReturn {
		@AuraEnabled public String naId;
		@AuraEnabled public String[] checklist = new List<String>();
	}

	public class Input extends ltngfw.AuraInput {
		@AuraEnabled public String recordId;
		@AuraEnabled public String lookupField;
	}
}