/* Class:       AccountTriggerHandler
** Created by:  OpFocus (Veena Sundara-Heragu) on 07/25/2017
** Description: Methods called from Account.trigger
**				+markForCallout
**					set CDC_Update_Required__c true if account name has changed and there is more than one record
**				+makeCallout
**					makes callout if account name has changed and there is just one record
*/
public class AccountTriggerHandler 
{

	// Description	: makes callout if account name has changed and there is just one record
	//					If there is moer than one record, creates Mirror_API_Backlog__c records for each one
	// @param 		: lstNew - List of Accounts 
	// @param 		: oldMap - map of old records - this will be null in insert trigger 
	// @return		: 
	public static void makeCallout(List<Account> lstNew)
	{

		// 12/12/2017 - changed to do on ALL updates
		
		//if(oldMap == null) // insert
		//{
			if(lstNew.size() == 1)
			{
				system.debug('=======> going to make callout');
				// 1 record inserted - make callout to admin app
				String endPoint = AdminApputils.getAdminAppBaseUrl() + 
									'.careercruising.com/api/Integrations/AccountTrigger?ID=' + 
									lstNew[0].Id;	
				AdminApputils.makeCallout(endPoint,'AccountTriggerHandler.makeCallout');
			}
			else
			{
				// more than one record inserted, add records to Mirror_API_Backlog__c 
				AdminApputils.createBacklogs(lstNew);
			}

		//	return;
		//}

		//// For updates, call method ONLY for records whose names have changed
		//List<Account> lstAccount = new List<Account>();
		//for(Account acc : lstNew)
		//{
		//	Account oldAcc = oldMap.get(acc.Id) ;

		//	if(acc.Name != oldAcc.Name)
		//	{
		//		lstAccount.add(acc) ;
		//	}
		//}


		//if(!lstAccount.isEmpty() && lstAccount.size() == 1)
		//{
		//	// ONE account name changed so make call out to admin app
		//	String endPoint = 'https://adminapp.careercruising.com/api/Integrations/AccountTrigger?ID=' + lstAccount[0].Id;	
		//	AdminApputils.makeCallout(endPoint);
		//}
		//else
		//{
		//	// more than one record name changed, add records to Mirror_API_Backlog__c 
		//	AdminApputils.createBacklogs(lstAccount);
		//}
	}


	/**
	 * If Update_Contract_End_Date__c is checked, find the maximum value of EndDate of all child Contracts and
	 * assign it to ContractEndDate__c. Uncheck Update_Contract_End_Date__c.
	 * @param lstAccount		Trigger.new of BEFORE UPDATE trigger (BEFORE because we are udpating Account fields)
	 * NOTE - UNIT TEST IS ContractTriggerTest
	 */
	public static void updateContractEndDate(List<Account>lstAccount)
	{
		Map<Id, Account> mapAccountsToProcess = new Map<Id, Account>();
		for(Account a : lstAccount)
		{
			if(a.Update_Contract_End_Date__c)
			{
				// set it to null here so that, if no contract records are found, it will be null.  If there are contracts,
				// the maximum end date and start date will get populated in this field
				a.LatestContract__c = null;
				mapAccountsToProcess.put(a.Id, a);
			}
		}

		if(!mapAccountsToProcess.isEmpty())
		{
			Map<Id, Id>mapContractByAccount = new Map<Id, Id>();
			for(Contract c: [SELECT Id, AccountId, EndDate
								FROM Contract
								WHERE AccountId in :mapAccountsToProcess.keySet()
										AND Status = 'Activated'
								ORDER BY AccountId, EndDate Desc])
			{
				if(!mapContractByAccount.containsKey(c.AccountId))
				{
					Account a = mapAccountsToProcess.get(c.AccountId);
					a.Update_Contract_End_Date__c = false; // uncheck since we have processed
					a.LatestContract__c = c.Id;
					mapContractByAccount.put(a.Id, c.Id); // we want to ONLY pick the contract with the latest date
				}
			}
		}
	}
}