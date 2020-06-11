/* Class:       CmpCreateSystemCtrl
** Created by:  OpFocus (Veena Sundara-Heragu) on 06/01/2017
** Description: Controller for lightning component CmpCreateSystem
*/
public class CmpCreateSystemCtrl 
{
	


	// Description	: gets account Type
	// @param 		: accountId - Id of Account
	@AuraEnabled
	public static System__c ctrlFetchSystem( String accountId)
	{
		try
		{
			System__c retVal;

			System__c[] lstSystem = Database.query('Select ' + SchemaHelper.getSObjectFields('System__c') +
														' From System__c Where Account__c = :accountId');
			
			// if no system, check for parent account system
			if(lstSystem.isEmpty())
			{

				Account[] parentAcc = Database.query('Select ' + SchemaHelper.getSObjectFields('Account') +
														' From account Where id = :accountId');	

				// must set up debug in SF for user, date range (max is 1 day, and level of detail)
				system.debug('=========> parentAcc = ' + parentAcc[0].ParentId);

				string ParentId = parentAcc[0].ParentId;

				if(!(ParentId == null)) 
				{
					lstSystem = Database.query('Select ' + SchemaHelper.getSObjectFields('System__c') +
														' From System__c Where Account__c = :ParentId');
				} 
			}										
		
			if(!lstSystem.isEmpty())
			{
				retVal = lstSystem[0];
			}

			return retVal;
		}
		catch (Exception ex)
		{
			throw new AuraHandledException('Exception occured:\r\n' + ex.getMessage() + '\r\n' + ex.getStackTraceString() + '\r\n');
		}
	}

	// Description	: saves "System" record
	// @param 		: accountId - Id of Account
	// @param		: systemStr - System record in string form
	@AuraEnabled
	public static void ctrlSave( String accountId, String systemStr)
	{
		try
		{
			System__c newSystem = (System__c) JSON.deserializeStrict(systemStr, System__c.Class);
			newSystem.Account__c = accountId;
			Account a = [Select Id, Name from Account where Id = :accountId];
			newSystem.Name = a.Name;


			insert newSystem;
		}
		catch (Exception ex)
		{
			throw new AuraHandledException('Exception occured:\r\n' + ex.getMessage() + '\r\n' + ex.getStackTraceString() + '\r\n');
		}
	}

	// Description	: gets Type for Account if it exists
	// @param 		: accountId - Id of Account
	@AuraEnabled
	public static AccountWrapper ctrlCheckAccountType(String accountId)
	{
		try
		{
			// If passing JSON string, add the parameter ie. String respStr
			// then destringify it back to an object
			//AccountWrapper aw = (AccountWrapper)JSON.deserializeStrict(respStr, AccountWrapper.Class);

			AccountWrapper retVal;

			Account[] lstAccount = Database.query('Select Type from Account Where Id = :accountId');
	
			List<Profile> MyProfile = [SELECT Id, Name FROM Profile WHERE Id=:userinfo.getProfileId() LIMIT 1];
			string MyProfileName = MyProfile[0].Name;

			if(!lstAccount.isEmpty())
			{
				retVal = new AccountWrapper(lstAccount[0], MyProfile[0].Name);
			}
			
			// must set up debug in SF for user, date range (max is 1 day, and level of detail)
			system.debug('=========> retVal = ' + JSON.serializePretty(retVal));
			return retVal;

		}
		catch (Exception ex)
		{
			throw new AuraHandledException('Exception occured:\r\n' + ex.getMessage() + '\r\n' + ex.getStackTraceString() + '\r\n');
		}
	}


	public Class AccountWrapper 
	{
		@AuraEnabled public Account a;
		@AuraEnabled public String profile;

		public AccountWrapper(Account acc, String profileName)
		{
			a = acc;
			profile = profileName;
		}
	}

}