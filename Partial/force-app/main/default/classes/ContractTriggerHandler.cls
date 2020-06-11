/* Class:       ContractTriggerHandler
** Created by:  OpFocus (Veena Sundara-Heragu) on 6/27/18
** Description: Methods for Contract.trigger
*/
public with sharing class ContractTriggerHandler
{

    /**
     * For Insert and Delete of Activated Contracts, this method will check the flag on the parent account which will cause
     * the account trigger to update it's ContractEndDate__c
     * @param lstContract   Trigger.new of AFTER INSERT ot Trigger.old of AFTER DELETE trigger
     */
    public static void updateAccountContractEndDate(List<Contract>lstContract)
    {
        List<Account> lstUpdateAccount = new List<Account>();
        for(Contract c : lstContract)
        {
            if(c.EndDate != null && c.AccountId != null && c.Status == 'Activated')
            {
                lstUpdateAccount.add(new Account(   Id                          = c.AccountId,
                                                    Update_Contract_End_Date__c = true)); // Account trigger will perform the update of ContractEndDate__c
            }
        }

        if(!lstUpdateAccount.isEmpty())
        {
            update lstUpdateAccount;
        }
    }

    /**
     * For Update of Contracts:
     *      If a Contract gets Activated, Update_Contract_End_Date__c of the parent account is checked
     *      if the EndDate of an Activated is changed, Update_Contract_End_Date__c of the parent account is checked
     *      The account trigger will then update the ContractEndDate__c of the account
     * @param lstContract       Trigger.new of AFTER UPDATE trigger
     * @param mapOld            Trigger.oldMap of AFTER UPDATE trigger
     */
    public static void updateAccountContractEndDate(List<Contract>lstContract, Map<Id, Contract>mapOld)
    {
        List<Account> lstUpdateAccount = new List<Account>();
        for(Contract c : lstContract)
        {
            Contract oldC = mapOld.get(c.Id);
            // Contract gets activated or Activated Contract has its end date changed
            if(c.AccountId != null && c.Status == 'Activated' && (c.EndDate != oldC.EndDate || oldC.Status != 'Activated') )
            {
                lstUpdateAccount.add(new Account(   Id                          = c.AccountId,
                                                    Update_Contract_End_Date__c = true)); // Account trigger will perform the update of ContractEndDate__c
            }

        }

        if(!lstUpdateAccount.isEmpty())
        {
            update lstUpdateAccount;
        }
    }
}