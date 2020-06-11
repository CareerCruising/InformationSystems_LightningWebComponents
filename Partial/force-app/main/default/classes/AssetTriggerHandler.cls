/* Class:       AssetTriggerHandler
 * Created On:  Sept 2017
 * Created by:  J. Pipkin (OpFocus, Inc)
 */
 
public with sharing class AssetTriggerHandler {

	// Description	: makes callout if Asset name has changed and there is just one record
	//					If there is moer than one record, creates Mirror_API_Backlog__c records for each one
	// @param 		: lstNew - List of Asset 
	// @param 		: oldMap - map of old records - this will be null in insert trigger 
	// @return		: 
	public static void makeCallout(List<Asset> lstNew, Map<Id, Asset> oldMap)
	{

		if(oldMap == null) // insert
		{
			if(lstNew.size() == 1)
			{
				if (processedIds.contains(lstNew[0].Id)) {
					return; // do not process same record 2 in 1 transation
				}
				// 1 record inserted - make callout to admin app
				String endPoint = AdminApputils.getAdminAppBaseUrl() + 
									'.careercruising.com/api/Integrations/AssetMirrorTrigger?ID=' + 
									lstNew[0].Id;	
				AdminApputils.makeCallout(endPoint,'AssetTriggerHandler.makeCallout');
				processedIds.add(lstNew[0].Id);
			}
			else
			{
				List<Asset> lstAssets = new List<Asset>();
				for(Asset asset : lstNew)
				{
					if(!processedIds.contains(asset.Id))
					{
						lstAssets.add(asset);
						processedIds.add(asset.Id);
					}
				}

				// more than one record inserted, add records to Mirror_API_Backlog__c 
				AdminApputils.createBacklogs(lstAssets);
			}

			return;
		}

		// when deleting, record is in oldMap
		if(Trigger.isDelete){
			if(oldMap.values().size() == 1)
			{
				if (processedIds.contains(oldMap.values()[0].Id)) {
					return; // do not process same record 2 in 1 transation
				}
				// ONE record deleted so make call out to admin app
				String endPoint = AdminApputils.getAdminAppBaseUrl() + 
									'.careercruising.com/api/Integrations/AssetMirrorTrigger?ID=' + 
									oldMap.values()[0].Id;	
				processedIds.add(oldMap.values()[0].Id);
				AdminApputils.makeCallout(endPoint,'AssetTriggerHandler.makeCallout');
			}
			else
			{
				List<Asset> lstAssets = new List<Asset>();
				for(Asset asset : (List<Asset>)Trigger.old)
				{
					if(!processedIds.contains(asset.Id))
					{
						lstAssets.add(asset);
						processedIds.add(asset.Id);
					}
				}

				// more than one record deleted. Add them all to Mirror_API_Backlog__c
				AdminApputils.createBacklogs(lstAssets);
			}
			return;
		}

		// For updates, call method ONLY for records whose names have changed
		List<Asset> lstAssets = new List<Asset>();
		for(Asset asset : lstNew)
		{
			Asset oldAsset = oldMap.get(asset.Id) ;

			if(asset.Name != oldAsset.Name && !processedIds.contains(asset.Id))
			{
				lstAssets.add(asset) ;
				processedIds.add(asset.Id);
			}
		}
		if(!lstAssets.isEmpty() && lstAssets.size() == 1)
		{
			// ONE asset name changed so make call out to admin app
			String endPoint = AdminApputils.getAdminAppBaseUrl() + 
								'.careercruising.com/api/Integrations/AssetMirrorTrigger?ID=' + 
								lstAssets[0].Id;	
			AdminApputils.makeCallout(endPoint,'AssetTriggerHandler.makeCallout');
		}
		else
		{
			// more than one record name changed, add records to Mirror_API_Backlog__c 
			AdminApputils.createBacklogs(lstAssets);
		}
	}

	@TestVisible private static Set<Id> processedIds = new Set<Id>();
}