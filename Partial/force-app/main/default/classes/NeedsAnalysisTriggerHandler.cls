/* Class:       NeedsAnalysisTriggerHandler
 * Created On:  Oct 2018
 * Created by:  J. Pipkin (OpFocus, Inc)
 */
 
public with sharing class NeedsAnalysisTriggerHandler {

    /**
     * if From_Opp__c field is populated, link the record to the Opportunity.
     * @param lstNA [description]
     */
    public static void linkToOpportunity(Needs_Analysis__c[] lstNA){
        Map<Id,Opportunity> mapOpps = new Map<Id,Opportunity>();
        for(Needs_Analysis__c na : lstNA){
            if(na.From_Opp__c != null && na.Maps_To_Opp__c){
                Opportunity opp = new Opportunity(Id=na.From_Opp__c);
                opp.Needs_Analysis__c = na.Id;
                mapOpps.put(opp.Id, opp);
            }
        }

        if (!mapOpps.values().isEmpty()) {
            update mapOpps.values();
        }
    }


    /**
     * if Account__c field is populated and From_Opp__c is not, link the record to the Account.
     * @param lstNA [description]
     */
    public static void linkToAccount(Needs_Analysis__c[] lstNA){
        Map<Id,Account> mapAccs = new Map<Id,Account>();
        for(Needs_Analysis__c na : lstNA){
            if(na.From_Opp__c == null && na.Account__c != null){
                Account a = new Account(Id                          = na.Account__c,
                                        Primary_Needs_Analysis__c   = na.Id);
                mapAccs.put(a.Id, a);
            }
        }

        update mapAccs.values();
    }
}