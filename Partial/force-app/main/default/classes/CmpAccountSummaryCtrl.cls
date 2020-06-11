/* Class:       CmpAccountSummaryCtrl
** Created by:  OpFocus (Veena Sundara-Heragu) on 06/27/2017
** Description: Controller for CmpAccountSummary lightning component
*/
public class CmpAccountSummaryCtrl 
{

	// Description	: gets Account record and related records
	// @param 		: accountId - Id of Account
	@AuraEnabled
	public static AccountWrapper ctrlFetchAccount(Id recordId, String accountLookupFieldName)
	{
		try
		{
			AccountWrapper retVal;

			if(recordId == null || accountLookupFieldName == null || accountLookupFieldName == '')
			{
				return retVal;
			}

			String objName = recordId.getSobjectType().getDescribe().getName();

			// first get the Account Id stored in the lookup field
			Sobject[] lstObj = Database.query('Select ' + accountLookupFieldName + ' From ' + objName + 
												' Where Id = :recordId');
			if(lstObj.isEmpty())
			{
				return retVal;
			}

			Id accountId = (Id) lstObj[0].get(accountLookupFieldName);
			// now, fetch the account and related information
			Account[] lstAccount = [Select Id,Name,ParentId,SchoolId__c,InstitutionId__c,RegionId__c,ExpiryDate__c From Account where Id = :accountId];

			//Account[] lstAccount = Database.query('Select ' + SchemaHelper.getSObjectFields('Account') +
			//										' From Account Where Id = :accountId');
			if(!lstAccount.isEmpty())
			{
				retVal = new AccountWrapper(lstAccount[0]);
			}

			return retVal;
		}
		catch (Exception ex)
		{
			throw new AuraHandledException('Exception occured:\r\n' + ex.getMessage() + '\r\n' + ex.getStackTraceString() + '\r\n');
		}
	}


	public class AccountWrapper
	{
	 	@AuraEnabled public Account a;
		@AuraEnabled public System__c s;
		@AuraEnabled public String sColor;
		@AuraEnabled public String rColor;
		@AuraEnabled public String xColor;
		@AuraEnabled public Integer onboradingCompletionPercent;

		public AccountWrapper(Account acc)
		{
			a = acc;

			String accId = (String) acc.Id;
			String accParentId = (String) acc.ParentId;

			//System__c[] lstSystem = [Select Id,Onboarding_Completion_Percent__c,Name from System__c where Account__c = :a.Id];

			System__c[] lstSystem = Database.query('Select ' + SchemaHelper.getSObjectFields('System__c') +
									' From System__c where Account__c = :accId');

			if(lstSystem.isEmpty())
			{
				//lstSystem = [Select Id,Onboarding_Completion_Percent__c,Name from System__c where Account__c = :a.ParentId];

				lstSystem = Database.query('Select ' + SchemaHelper.getSObjectFields('System__c') +
						' From System__c where Account__c = :accParentId');

			}
			if(!lstSystem.isEmpty())
			{
				s = lstSystem[0];
			}

			sColor = a.SchoolId__c == null ? 'white' : 
					   a.ExpiryDate__c == null ? 'white' :
					    a.ExpiryDate__c >= system.today() ? 'green' : 'gray';
			rColor = a.RegionId__c == null ? 'white' : 
					   a.ExpiryDate__c == null ? 'white' :
					    a.ExpiryDate__c >= system.today() ? 'green' : 'gray';
			xColor = a.InstitutionId__c == null ? 'white' : 
					   a.ExpiryDate__c == null ? 'white' :
					    a.ExpiryDate__c >= system.today() ? 'green' : 'gray';

			onboradingCompletionPercent = s == null || s.Onboarding_Completion_Percent__c == null ? 0 : Integer.valueOf(s.Onboarding_Completion_Percent__c);
		}
	}
}