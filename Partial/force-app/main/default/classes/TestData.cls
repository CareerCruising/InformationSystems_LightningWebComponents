/* Class:       TestData
** Created by:  OpFocus (Veena Sundara-Heragu) on 06/08/2017
** Description: Methods used to create data for unit tests
*/
@isTest
public class TestData 
{

	public static Account buildAccount(String accountName)
	{
		Account a = new Account(Name = accountName);
		a.SIS_Vendor__c = 'Maple';
		return a;
	}

	public static Account buildChildAccount(string accountName, Id parentId)
	{
		Account a = new Account(Name = accountName, ParentId = parentId);
		return a;
	}


	public static System__c buildSystem(Id accountId)
	{
		System__c s = new System__c(Account__c = accountId);
		return s;
	}

	public static Opportunity buildOpportunity(Id accountId, String name, Id primaryCampaign)
	{
		Opportunity o = new Opportunity(Name = name,
										AccountId = accountId,
										StageName = 'Needs Based Analysis',
										CloseDate = system.today().addDays(30),
										CampaignId = primaryCampaign,
										LeadSource = 'Operations',
										StartDate__c = system.today());
		return o;
	}

	public static OpportunityLineItem buildOli (Id oppId, PricebookEntry pbe, Decimal qty) {
		OpportunityLineItem oli  = new OpportunityLineItem();
		oli.OpportunityId        = oppId;
		oli.PricebookEntryId     = pbe.Id;
		oli.Quantity             = qty;
		oli.TotalPrice           = qty*pbe.UnitPrice;

		return oli;
	}



	public static Product2 buildProduct(String name, String family) {
		Product2 prod = new Product2(	Name		= name,
										IsActive	= true,
										Family 		= family,
										Division__c = 'Xello');
		return prod;
	}



	public static Campaign buildCampaign(String name)
	{
		Campaign c = new Campaign(Name = name, isActive=true);
		return c;
	}

	public static Asset buildAsset(Id accountId)
	{
		Asset a = new Asset(AccountId = accountId);
		a.Name = 'Test Asset';
		return a;
	}

	public static Lead buildLead(String companyName)
	{
		Lead l = new Lead(Company = companyName, LastName='Test');
		return l;
	}

	public static Contact  buildContact(Id accountId, String firstName, String lastName)
	{
		Contact c = new Contact(AccountId = accountId,
								FirstName = firstName,
								LastName = lastName,
								MailingStateCode = 'MI');
		return c;
	}

	public static Contract  buildContract(Id accountId, Date start, Integer numMonths)
	{
		Contract c = new Contract(AccountId = accountId,
									StartDate = start,
									ContractTerm = numMonths);
		return c;
	}
	public static Task buildTask(Id whoId, String subject) {
		Task t = new Task(WhoId = whoId,
						Subject = subject,
						Priority = 'Normal',
		                Status = 'Open');
		return t;
	}

	public static Needs_Analysis__c buildNeedsAnalysis(Id accountId){
		Needs_Analysis__c na = new Needs_Analysis__c();
		na.Account__c = accountId;
		return na;
	}
}