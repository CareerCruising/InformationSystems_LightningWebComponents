/* Class:       LeadTriggerHandler
** Created by:  OpFocus (Veena Sundara-Heragu) on 10/30/2017
** Description: Methods called from Lead trigger
**				+matchContactEmail
**					Try to match the email to existing contacts.  if more than one Contact matches, use the first one.  Then
**					populate teh Contact Link, Account Link, Company Name, City, State and Country baed on this contact
**				+sanitizeCompanyName
**					Use the custom metadata type Company_Name_Map__mdt to map abbreviations to their expansions and make the
**					Company standard
**				+getAccountInfo
**					On Update, if AccountLink__c gets populated, pull Company, City, State and Country from account
*/
public class LeadTriggerHandler 
{

	public static void matchContactEmail(List<Lead> lstLead)
	{
		findMatchingContact(lstLead);
	}
	public static void matchContactEmail(List<Lead> lstNew, Map<Id, Lead> mapOld)
	{
		List<Lead> lstProcessLeads = new List<Lead>();
		for(Lead l : lstNew)
		{
			// if email has changed, we need to find matching contact for new email
			if(l.Email != mapOld.get(l.Id).Email)
			{
				lstProcessLeads.add(l);
			}
		}

		if(!lstProcessLeads.isEmpty())
		{
			findMatchingContact(lstProcessLeads);
		}
	}

	private static void findMatchingContact(List<Lead> lstLead)
	{
		// collect emails for all leads
		Set<String> setEmail = new Set<String>();
		for(Lead l : lstLead)
		{
			if(l.Email != null)
			{
				setEmail.add(l.Email);
			}
		}

		// get contacts with matching emails
		Map<String, Contact> mapContactByEmail = new Map<String, Contact>();
		for(Contact c : [Select Id, AccountId, Account.Name, Email,
									Account.BillingCity, Account.BillingState, Account.BillingCountry
							from Contact where Email in :setEmail ])
		{
			if(!mapContactByEmail.containsKey(c.Email))
			{
				mapContactByEmail.put(c.Email, c);
			}
		}

		// now, go through the Leads and populate matching Contacts
		for(Lead l : lstLead)
		{
			Contact c = mapContactByEmail.get(l.Email);
			if(c == null)
			{
				// no matching contact, so blankout fields
				l.ContactLink__c = null;
				l.AccountLink__c = null;
				l.City = null;
				l.State = null;
				l.Country = null;
			}
			else
			{
				// found matching contact, populate fields
				l.ContactLink__c = c.Id;
				l.AccountLink__c = c.AccountId;
				l.City = c.Account.BillingCity;
				l.State = c.Account.BillingState;
				l.Country = c.Account.BillingCountry;
				l.Company = c.Account.Name;
				l.Lead_Trigger_Executed__c = true; // so that VR prevents users from changing the Account/Contact links
			}
		}
	}


	public static void sanitizeCompanyName(List<Lead> lstLead)
	{
		for(Lead l : lstLead)
		{
			if(l.ContactLink__c == null) // no Contact matching the email was found
			{
				l.Company = sanitizeName(l.Company);
			}
		}
	}

	private static List<Company_Name_Map__mdt> lstCMT;
	private static List<Company_Name_Map__mdt> getMappings()
	{
		if(lstCMT == null)
		{
			// get records from custom metadata type that define how abbreviations should be matched
			lstCMT = [Select Id, Abbreviation__c, Expansion__c from Company_Name_Map__mdt];
		}
		return lstCMT;
	}
	private static String sanitizeName(String source)
	{
		String retVal = source;
		if(source == null)
		{
			return retVal;
		}
		List<Company_Name_Map__mdt> lstCMT = getMappings();
		for(Company_Name_Map__mdt cmt : lstCMT)
		{
			retVal = retVal.replace(' ' + cmt.Abbreviation__c + ' ', ' ' + cmt.Expansion__c + ' ');
			retVal = retVal.replaceAll(' ' + cmt.Abbreviation__c + '$', ' ' + cmt.Expansion__c);
			retVal = retVal.replaceAll('^' + cmt.Abbreviation__c + ' ',  cmt.Expansion__c + ' ');
		}
		retVal = retVal.replace('-', ' ');
		return retVal;
	}


	public static void getAccountInfo(Map<Id, Lead> mapNew, Map<Id, Lead> mapOld)
	{
		Map<Id, Set<Id>> mapLeadsByAccount = new Map<Id, Set<Id>>();
		for(Lead l : mapNew.values())
		{
			// if email has changed, we need to find matching contact for new email
			if(l.AccountLink__c != mapOld.get(l.Id).AccountLink__c &&
				l.AccountLink__c != null)
			{
				if(mapLeadsByAccount.containsKey(l.AccountLink__c))
				{
					mapLeadsByAccount.get(l.AccountLink__c).add(l.Id);
				}
				else
				{
					mapLeadsByAccount.put(l.AccountLink__c, new Set<Id>{l.Id});
				}
			}
		}

		if(!mapLeadsByAccount.isEmpty())
		{
			for(Account a : [Select Id, Name, BillingCity, BillingState, BillingCountry from Account 
								where Id in :mapLeadsByAccount.keySet()])
			{
				for(Id leadId : mapLeadsByAccount.get(a.Id))
				{
					Lead l = mapNew.get(leadId);
					l.Company = a.Name;
					l.City = a.BillingCity;
					l.State = a.BillingState;
					l.Country = a.BillingCountry;
				}
			}
		}
	}
}