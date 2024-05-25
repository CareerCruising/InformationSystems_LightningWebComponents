@isTest
private class OppDetailsTest {

    // Utility method to create test data
    private static void createTestData() {
        // Create an Account
        Account testAccount = new Account(Name = 'Test Account', Gov_Id__c = '12345');
        insert testAccount;

        // Create a Product2
        Product2 testProduct = new Product2(Name = 'Test Product');
        insert testProduct;

        // Create an Opportunity
        Opportunity testOpportunity = new Opportunity(Name = 'Test Opportunity', StageName = 'Prospecting', CloseDate = System.today().addDays(30), AccountId = testAccount.Id);
        insert testOpportunity;

        // Create an OpportunityLineItem
        OpportunityLineItem testOli = new OpportunityLineItem(OpportunityId = testOpportunity.Id, Product2Id = testProduct.Id, UnitPrice = 100, Quantity = 1);
        insert testOli;

        // Create an Asset
        Asset testAsset = new Asset(Name = 'Test Asset', AccountId = testAccount.Id, Setting1__c = 'Setting1', Setting2__c = 'Setting2');
        insert testAsset;
    }

    @isTest static void testGetOliAndAssets() {
        // Setup test data
        createTestData();

        // Retrieve the inserted Opportunity and Product2 for testing
        Opportunity insertedOpp = [SELECT Id FROM Opportunity LIMIT 1];
        Product2 insertedProduct = [SELECT Id FROM Product2 LIMIT 1];

        // Test the method with product2Id as null
        Map<String, Object> resultWithoutProduct2Id = OppDetails.getOliAndAssets(insertedOpp.Id, null);
        System.assertNotEquals(null, resultWithoutProduct2Id, 'The result should not be null.');
        System.assertEquals(true, resultWithoutProduct2Id.containsKey('opportunityLineItems'), 'Map should have opportunityLineItems key.');
        System.assertEquals(true, resultWithoutProduct2Id.containsKey('relatedAssets'), 'Map should have relatedAssets key.');

        // Test the method with a specific product2Id
        Map<String, Object> resultWithProduct2Id = OppDetails.getOliAndAssets(insertedOpp.Id, insertedProduct.Id);
        System.assertNotEquals(null, resultWithProduct2Id, 'The result should not be null.');
        System.assertEquals(true, resultWithProduct2Id.containsKey('opportunityLineItems'), 'Map should have opportunityLineItems key.');
        System.assertEquals(true, resultWithProduct2Id.containsKey('relatedAssets'), 'Map should have relatedAssets key.');

        // Add more assertions as needed to validate the data in opportunityLineItems and relatedAssets
    }
}
