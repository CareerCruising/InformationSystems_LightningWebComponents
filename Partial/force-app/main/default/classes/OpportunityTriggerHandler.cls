/* Class:       OpportunityTriggerHandler
 * Created On:  Sept 2017
 * Created by:  J. Pipkin (OpFocus, Inc)

 */
 
public with sharing class OpportunityTriggerHandler {
	
	// Description	: makes callout if opportunity stagename has changed and there is just one record
	//					If there is moer than one record, creates Mirror_API_Backlog__c records for each one
	// @param 		: lstNew - List of Opportunity 
	// @param 		: oldMap - map of old records - this will be null in insert trigger 
	// @return		: 
	public static void makeCallout(List<Opportunity> lstNew, Map<Id, Opportunity> oldMap)
	{

		if(oldMap == null) // insert
		{
			if(lstNew.size() == 1)
			{
				
				system.debug('=========> Inserting opp = ' + lstNew[0].Id);
				// 1 record inserted - make callout to admin app
				String endPoint = AdminApputils.getAdminAppBaseUrl() + 
									'.careercruising.com/api/Integrations/OpportunityMirrorTrigger?ID=' + 
									lstNew[0].Id;	

				system.debug('opp add endpoint: ' + endPoint);									
				AdminApputils.makeCallout(endPoint,'OpportunityTriggerHandler.makeCallout');
			}
			else
			{
				// more than one record inserted, add records to Mirror_API_Backlog__c 
				AdminApputils.createBacklogs(lstNew);
			}

			return;
		}

		// when deleting, record is in oldMap
		if(Trigger.isDelete){
			
			system.debug('========> in delete, num = ' + oldMap.size());
			if(oldMap.values().size() == 1)
			{
				// make sure Delete Check has been performed
				if (!oldMap.values()[0].Is_Delete_Check_Done__c) {
					// do not allow delete if check was not performed
					oldMap.values()[0].addError('You must use Integrations/OpportunityDeleteCheck before you delete an Opportunity.');
				}
				// 12/5/2017 OpFocus (Bfinn) : Updated to implement Phase 1 & 2
				// ONE record deleted so make call out to admin app
//				String endPoint = 'https://adminapp.careercruising.com/api/Integrations/OpportunityMirrorTrigger?ID=' + oldMap.values()[0].Id;	
//				String endPoint = 'https://adminapp.careercruising.com/api/Integrations/OpportunityDeleteCheck?Id=' + oldMap.values()[0].Id;	
//				//AdminApputils.makeCallout(endPoint);
			}
			else
			{
				// more than one record deleted. Add them all to Mirror_API_Backlog__c
				AdminApputils.createBacklogs(Trigger.old);
			}
			return;
		}

		// For updates, call method ONLY for records whose accounts have changed
		List<Opportunity> lstAccountChangedOpps = new List<Opportunity>();
		List<Opportunity> lstStageChangedOpps = new List<Opportunity>();
		List<Opportunity> lstOwnerChangedOpps = new List<Opportunity>();
		for(Opportunity opp : lstNew)
		{
			Opportunity oldOpp = oldMap.get(opp.Id) ;

			// collect all opps whose AccountId has changed into one list
			if(opp.AccountId != oldOpp.AccountId)
			{
				lstAccountChangedOpps.add(opp) ;
			}

			//collect all opps whose stage has changed into another list (because adminapp endpoint is different)
			if(opp.StageName != oldOpp.StageName)
			{
				lstStageChangedOpps.add(opp) ;
			}

			if(opp.OwnerId != oldOpp.OwnerId)
			{
				lstOwnerChangedOpps.add(opp) ;
			}
		}

		if(!lstOwnerChangedOpps.isEmpty() && lstOwnerChangedOpps.size() == 1)
		{

			// 1 record changed - make callout to admin app
			system.debug('=========> Changing owner for opp = ' + lstNew[0].Id);

			String endPoint = AdminApputils.getAdminAppBaseUrl() + 
								'.careercruising.com/api/Integrations/OpportunityMirrorTrigger?ID=' + 
								lstNew[0].Id;	

			system.debug('opp owner change endpoint: ' + endPoint);									
			AdminApputils.makeCallout(endPoint,'OpportunityTriggerHandler.makeCallout');

			return;

		}


		if(!lstAccountChangedOpps.isEmpty() && lstAccountChangedOpps.size() == 1)
		{
			// ONE Opportunity account changed so make call out to admin app
			String endPoint = AdminApputils.getAdminAppBaseUrl() + 
								'.careercruising.com/api/Integrations/OpportunityAccountChange?ID=' + 
								lstAccountChangedOpps[0].Id;	
			AdminApputils.makeCallout(endPoint,'OpportunityTriggerHandler.makeCallout');
		}
		else
		{
			// more than one record's Account changed, add records to Mirror_API_Backlog__c 
			AdminApputils.createBacklogs(lstAccountChangedOpps);
		}

		if(!lstStageChangedOpps.isEmpty() && lstStageChangedOpps.size() == 1)
		{
			// ONE Opportunity Stage changed so make call out to admin app
			String endPoint = AdminApputils.getAdminAppBaseUrl() + 
								'.careercruising.com/api/Integrations/OpportunityMirrorTrigger?ID=' + 
								lstStageChangedOpps[0].Id;	
			AdminApputils.makeCallout(endPoint,'OpportunityTriggerHandler.makeCallout');
		}
		else
		{
			// more than one record's Stage changed, add records to Mirror_API_Backlog__c 
			AdminApputils.createBacklogs(lstStageChangedOpps);
		}
	}
}