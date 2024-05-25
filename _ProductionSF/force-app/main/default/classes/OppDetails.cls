public with sharing class OppDetails {

    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getOliAndAssets(Id opportunityId, Id product2Id) {
        // Building the SOQL query dynamically
        String soql = 'SELECT Id' +
            ',Product2Id' +
            ',Product2.Name' +
            ',Account__c' +
            ',Account__r.Name' +
            ',Account__r.Gov_Id__c ' +
            'FROM OpportunityLineItem ' +
            'WHERE OpportunityId = :opportunityId';

        if (product2Id != null) {
            soql += ' AND Product2Id = :product2Id';
        }
        
        // Execute the query
        List<OpportunityLineItem> oppLineItems = Database.query(soql);
  
        // Collect unique Account__c IDs
        Set<Id> accountIds = new Set<Id>();
        for (OpportunityLineItem item : oppLineItems) {
            accountIds.add(item.Account__c);
        }
    
        // Building the SOQL query for Assets
        String assetSoql = 'SELECT Id, Name, AccountId, Setting1__c, Setting2__c FROM Asset WHERE AccountId IN :accountIds';
        
        // Execute the Asset query
        List<Asset> relatedAssets = Database.query(assetSoql);

        // Create a map and add both lists to it
        Map<String, Object> resultMap = new Map<String, Object>();
        resultMap.put('opportunityLineItems', oppLineItems);
        resultMap.put('relatedAssets', relatedAssets);
    
        return resultMap;
    }
}
