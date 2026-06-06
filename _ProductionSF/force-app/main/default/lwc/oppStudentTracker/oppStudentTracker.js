import { LightningElement, wire, api } from 'lwc';

export default class OppStudentTracker extends LightningElement {
    @api recordId; // Assuming this is the Opportunity Id

    connectedCallback() {
        // Mock data for opportunityLineItems
        const opportunityLineItems = [
            {
                Id: 'oli1',
                Product2Id: 'prod21',
                Product2: { Name: 'Product 1' },
                Account__c: 'acc1',
                Account__r: { Name: 'Account 1', Gov_Id__c: 'govId1' }
            },
            {
                Id: 'oli2',
                Product2Id: 'prod22',
                Product2: { Name: 'Product 2' },
                Account__c: 'acc2',
                Account__r: { Name: 'Account 2', Gov_Id__c: 'govId2' }
            }
        ];

        // Mock data for relatedAssets
        const relatedAssets = [
            {
                Id: 'asset1',
                Name: 'Asset 1',
                AccountId: 'acc1',
                Setting1__c: 'Setting1 Value 1',
                Setting2__c: 'Setting2 Value 1'
            },
            {
                Id: 'asset2',
                Name: 'Asset 2',
                AccountId: 'acc2',
                Setting1__c: 'Setting1 Value 2',
                Setting2__c: 'Setting2 Value 2'
            }
        ];

        // Loop through opportunityLineItems
        console.log('Opportunity Line Items:');
        opportunityLineItems.forEach(item => {
            console.log(JSON.stringify(item));
        });

        // Loop through relatedAssets
        console.log('Related Assets:');
        relatedAssets.forEach(asset => {
            console.log(JSON.stringify(asset));
        });
    }
}