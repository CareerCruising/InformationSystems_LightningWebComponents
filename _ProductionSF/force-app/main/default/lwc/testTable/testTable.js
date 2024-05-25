import { LightningElement, track } from 'lwc';

export default class TestTable extends LightningElement {
    @track popover = {} //Handles all popover logic
    @track T01 = {
        data: null,
        SortField: 'Account__r_Name', //initial sort field
        SortAsc: true,
        PageRows: 20 //number of rows to display until we scroll to page bottom
    };

    @track PageVar = {
        ReportDataFound: true,
        SortField: 'Account__r_Name',
        SortAsc: true,
    };

    connectedCallback() { 
        setTimeout(() => {
            const scrollableContainer = this.template.querySelector('.scrollable-container');
            if (scrollableContainer) {
                scrollableContainer.addEventListener('scroll', this.handleScroll.bind(this));
            }
        }, 0);
        
        this.T01.data =  TableData; //This would normally be a database call
        for(let i = 0;i < this.T01.data.length;i++){
            var entry = this.T01.data[i];
            entry.ContractMonth = new Date(entry.StartDate__c).toLocaleDateString('en-us', { month:"short"}).toUpperCase();
            entry.ContractYear = new Date(entry.StartDate__c).toLocaleDateString('en-us', { year:"numeric"});
            entry.ContractDuration = 12 * entry.Contract_Duration__c;
            entry.ContractDuration = (entry.ContractDuration == 12) ? '': JSON.stringify(entry.ContractDuration);
            entry.ContractClass = (new Date(entry.StartDate__c) < new Date() && new Date(entry.EndDate__c) > new Date()) ? '' : 'ContractFaded';
            entry.Visible = (i <= this.T01.PageRows) ? true : false;
            console.log(entry.ContractClass);            
        } 
    }
    PopoverShow(event) {
        this.popover[event.target.dataset.popovername] = true;
    }
    PopoverHide(event) {
        //onsole.log(event.target.dataset.popovername);
        this.popover[event.target.dataset.popovername] = false;
    }
    sort(event) {
        //onsole.log(event.target.dataset.sortname);
        // Assuming the event target is within the same component, traverse up the DOM
        const closestTr = event.target.closest('tr');
        
        // If the <tr> is found within the same component
        if (closestTr) {
            const sortableElements = closestTr.querySelectorAll('[data-sortname]');

            sortableElements.forEach(element => {
                element.classList.remove('headerSortUp');          
                element.classList.remove('headerSortDown');   
            });
        }
        
        let FieldToSort = event.target.dataset.sortname;
        if(FieldToSort == null) return;

        // Determine which way to sort
        this.PageVar.SortAsc = (FieldToSort != this.PageVar.SortField) ? true : !this.PageVar.SortAsc;
        this.PageVar.SortField = FieldToSort;
        if(this.PageVar.SortAsc) {
            event.target.classList.add('headerSortUp');
        } else {
            event.target.classList.add('headerSortDown');
        }

        //run the actual sort
        let TempList = this.T01.data;
        TempList.sort((a, b) => {
            let valueA = a[FieldToSort];
            let valueB = b[FieldToSort];
        
            // Check if the values are numbers
            if (!isNaN(valueA) && !isNaN(valueB)) {
                valueA = Number(valueA);
                valueB = Number(valueB);
            }
            // Add any additional type checks here (e.g., for Date objects)
        
            // Comparison logic
            if(this.PageVar.SortAsc) {
                return valueA == valueB ? 0 : valueA > valueB ? 1 : -1;
            } else {
                return valueA == valueB ? 0 : valueA > valueB ? -1 : 1;
            }
        });

        //Display only X at a time
        for(let i = 0;i < TempList.length;i++){
            TempList[i].Visible = (i <= this.T01.PageRows) ? true : false;
        }        
        this.T01.data = TempList;

    }    
    
    handleScroll(event) {
        
        const scrollTop = event.target.scrollTop;
        const scrollHeight = event.target.scrollHeight;
        const clientHeight = event.target.clientHeight;

        console.log('scrollTop',scrollTop,'scrollHeight',scrollHeight,'clientHeight',clientHeight);

        if (scrollTop + clientHeight >= scrollHeight) {
            // User has reached the bottom
            this.loadMoreRows();
        }
    }

    loadMoreRows() {
        console.log('LoadMore');
        var FirstFound = 0
        for(let i = 0;i < this.T01.data.length;i++){
            var entry = this.T01.data[i];
            if(!entry.Visible && FirstFound == 0) { FirstFound = i } //Set Firstfound that is not visible
            if(i <= FirstFound + this.T01.PageRows) {
                entry.Visible = true;
            }          
        } 
    }
    
    navigateToSFRecordId(event) {  
        console.log('Nav',event.target.dataset);
    }    

    GetRowDetails(event) {  
        var CurrentId = event.target.dataset.id; console.log(CurrentId);
        var RowDetails = this.T01.data[this.T01.data.findIndex(obj => obj.Id == CurrentId)];
        console.log(RowDetails);
    }


}

var TableData = [
    {
        "Id": "00kI9000003CAKnIAO",
        "Account__r_Name": "Waupaca Christian Academy",
        "Name": "2023-DEC-N: Waupaca Christian Academy Xello for Middle School",
        "OpportunityId": "006I90000030YJlIAM",
        "StartDate__c": "2023-12-01T00:00:00",
        "EndDate__c": "2024-05-31T00:00:00",
        "Contract_Duration__c": 0.5,
        "TotalPrice": 20,
        "Product2_Name": "Xello for Middle School",
        "Description": "Wisconsin - Non Public School",
        "Quantity": 20
    },
    {
        "Id": "00kI90000035aofIAA",
        "Account__r_Name": "Adams Elementary School",
        "Name": "2023-JUL-R-CS: Janesville School District Xello for Elementary School",
        "OpportunityId": "006I9000002XVjSIAW",
        "StartDate__c": "2023-07-01T00:00:00",
        "EndDate__c": "2024-06-30T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 518,
        "Product2_Name": "Xello for Elementary School",
        "Description": "Grades K to 5",
        "Quantity": 259
    },
    {
        "Id": "00kI90000035aogIAA",
        "Account__r_Name": "Harrison Elementary School",
        "Name": "2023-JUL-R-CS: Janesville School District Xello for Elementary School",
        "OpportunityId": "006I9000002XVjSIAW",
        "StartDate__c": "2023-07-01T00:00:00",
        "EndDate__c": "2024-06-30T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 520,
        "Product2_Name": "Xello for Elementary School",
        "Description": "Grades K to 5",
        "Quantity": 260
    },
    {
        "Id": "00kI90000035aoiIAA",
        "Account__r_Name": "Jefferson Elementary School",
        "Name": "2023-JUL-R-CS: Janesville School District Xello for Elementary School",
        "OpportunityId": "006I9000002XVjSIAW",
        "StartDate__c": "2023-07-01T00:00:00",
        "EndDate__c": "2024-06-30T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 514,
        "Product2_Name": "Xello for Elementary School",
        "Description": "Grades K to 5",
        "Quantity": 257
    },
    {
        "Id": "00kI90000035aojIAA",
        "Account__r_Name": "Kennedy Elementary School",
        "Name": "2023-JUL-R-CS: Janesville School District Xello for Elementary School",
        "OpportunityId": "006I9000002XVjSIAW",
        "StartDate__c": "2023-07-01T00:00:00",
        "EndDate__c": "2024-06-30T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 708,
        "Product2_Name": "Xello for Elementary School",
        "Description": "Grades K to 5",
        "Quantity": 354
    },
    {
        "Id": "00kI90000035aokIAA",
        "Account__r_Name": "Lincoln Elementary School",
        "Name": "2023-JUL-R-CS: Janesville School District Xello for Elementary School",
        "OpportunityId": "006I9000002XVjSIAW",
        "StartDate__c": "2023-07-01T00:00:00",
        "EndDate__c": "2024-06-30T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 608,
        "Product2_Name": "Xello for Elementary School",
        "Description": "Grades K to 5",
        "Quantity": 304
    },
    {
        "Id": "00kI90000035aohIAA",
        "Account__r_Name": "Jackson Elementary School",
        "Name": "2023-JUL-R-CS: Janesville School District Xello for Elementary School",
        "OpportunityId": "006I9000002XVjSIAW",
        "StartDate__c": "2023-07-01T00:00:00",
        "EndDate__c": "2024-06-30T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 576,
        "Product2_Name": "Xello for Elementary School",
        "Description": "Grades K to 5",
        "Quantity": 288
    },
    {
        "Id": "00kI90000035aolIAA",
        "Account__r_Name": "Madison Elementary School",
        "Name": "2023-JUL-R-CS: Janesville School District Xello for Elementary School",
        "OpportunityId": "006I9000002XVjSIAW",
        "StartDate__c": "2023-07-01T00:00:00",
        "EndDate__c": "2024-06-30T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 608,
        "Product2_Name": "Xello for Elementary School",
        "Description": "Grades K to 5",
        "Quantity": 304
    },
    {
        "Id": "00kI90000031a02IAA",
        "Account__r_Name": "Kemp Junior High School",
        "Name": "2022-OCT-N: Kemp Independent School District Xello for Middle School",
        "OpportunityId": "006I9000002A5rrIAC",
        "StartDate__c": "2022-10-01T00:00:00",
        "EndDate__c": "2023-09-30T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 1589.5,
        "Product2_Name": "Xello for Middle School",
        "Description": "Student license fees – includes unlimited consultation and support.",
        "Quantity": 374
    },
    {
        "Id": "00kI90000031a08IAA",
        "Account__r_Name": "Kemp High School",
        "Name": "2022-OCT-N: Kemp Independent School District Xello for High School",
        "OpportunityId": "006I9000002A5rrIAC",
        "StartDate__c": "2022-10-01T00:00:00",
        "EndDate__c": "2023-09-30T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 2673,
        "Product2_Name": "Xello for High School",
        "Description": "Student license fees – includes unlimited consultation and support.",
        "Quantity": 540
    },
    {
        "Id": "00kI90000034UKVIA2",
        "Account__r_Name": "Washington Middle School",
        "Name": "2023-JUL-R-PU: Erie #1 BOCES (Contract # ITCC-130-2024 Jamestown CSD) Xello for Middle School",
        "OpportunityId": "006I9000002QFUjIAO",
        "StartDate__c": "2023-07-01T00:00:00",
        "EndDate__c": "2024-06-30T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 1350,
        "Product2_Name": "Xello for Middle School",
        "Description": "NY ITS Consortium",
        "Quantity": 450
    },
    {
        "Id": "00kI90000034UKWIA2",
        "Account__r_Name": "Persell Middle School",
        "Name": "2023-JUL-R-PU: Erie #1 BOCES (Contract # ITCC-130-2024 Jamestown CSD) Xello for Middle School",
        "OpportunityId": "006I9000002QFUjIAO",
        "StartDate__c": "2023-07-01T00:00:00",
        "EndDate__c": "2024-06-30T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 1200,
        "Product2_Name": "Xello for Middle School",
        "Description": "NY ITS Consortium",
        "Quantity": 400
    },
    {
        "Id": "00kI90000034UKXIA2",
        "Account__r_Name": "Jefferson Middle School",
        "Name": "2023-JUL-R-PU: Erie #1 BOCES (Contract # ITCC-130-2024 Jamestown CSD) Xello for Middle School",
        "OpportunityId": "006I9000002QFUjIAO",
        "StartDate__c": "2023-07-01T00:00:00",
        "EndDate__c": "2024-06-30T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 1200,
        "Product2_Name": "Xello for Middle School",
        "Description": "NY ITS Consortium",
        "Quantity": 400
    },
    {
        "Id": "00kI9000003ATAYIA4",
        "Account__r_Name": "Meridian Junior High School",
        "Name": "2023-SEP-R-PI: EFE 150 (Meridian Community) Xello for Middle School",
        "OpportunityId": "006I9000002ppszIAA",
        "StartDate__c": "2023-09-01T00:00:00",
        "EndDate__c": "2024-08-31T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 1074.15,
        "Product2_Name": "Xello for Middle School",
        "Description": null,
        "Quantity": 341
    },
    {
        "Id": "00kI9000003ATAZIA4",
        "Account__r_Name": "Stillman Valley High School",
        "Name": "2023-SEP-R-PI: EFE 150 (Meridian Community) Xello for High School",
        "OpportunityId": "006I9000002ppszIAA",
        "StartDate__c": "2023-09-01T00:00:00",
        "EndDate__c": "2024-08-31T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 1773.9,
        "Product2_Name": "Xello for High School",
        "Description": null,
        "Quantity": 486
    },
    {
        "Id": "00kI9000003ATAnIAO",
        "Account__r_Name": "Stillman Valley High School",
        "Name": "2023-SEP-R-DS: EFE 150 (Meridian Community) Xello for High School",
        "OpportunityId": "0061K00000j2GeEQAU",
        "StartDate__c": "2023-09-01T00:00:00",
        "EndDate__c": "2024-08-31T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": -1799.45,
        "Product2_Name": "Xello for High School",
        "Description": null,
        "Quantity": 493
    },
    {
        "Id": "00kI9000003ATAoIAO",
        "Account__r_Name": "Meridian Junior High School",
        "Name": "2023-SEP-R-DS: EFE 150 (Meridian Community) Xello for Middle School",
        "OpportunityId": "0061K00000j2GeEQAU",
        "StartDate__c": "2023-09-01T00:00:00",
        "EndDate__c": "2024-08-31T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": -967.05,
        "Product2_Name": "Xello for Middle School",
        "Description": null,
        "Quantity": 307
    },
    {
        "Id": "00kI9000003BZGaIAO",
        "Account__r_Name": "Sycamore Elementary School",
        "Name": "2025-JAN-R-DS: Sycamore Elementary School Xello for Elementary School",
        "OpportunityId": "006I9000002xnCbIAI",
        "StartDate__c": "2025-01-01T00:00:00",
        "EndDate__c": "2025-12-31T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 731.5,
        "Product2_Name": "Xello for Elementary School",
        "Description": "Student license fees – includes unlimited consultation and support.",
        "Quantity": 275
    },
    {
        "Id": "00kI9000003BZGdIAO",
        "Account__r_Name": "Southern New Hampshire University",
        "Name": "2024-JUN-R: Southern New Hampshire University Awato Career Pathways (Higher Ed)",
        "OpportunityId": "006I9000002xnCVIAY",
        "StartDate__c": "2024-06-01T00:00:00",
        "EndDate__c": "2025-05-31T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 9000,
        "Product2_Name": "Awato Career Pathways (Higher Ed)",
        "Description": "Includes  - Assessments  - Maching - Pathways - Branding - Custom Content",
        "Quantity": 9000
    },
    {
        "Id": "00kI90000039tufIAA",
        "Account__r_Name": "Blue Valley Southwest High",
        "Name": "2023-JUL-N: Greenbush Southeast (Unified School) YR 1/3 Xello for High School",
        "OpportunityId": "006I9000002HxFOIA0",
        "StartDate__c": "2023-07-01T00:00:00",
        "EndDate__c": "2024-06-30T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": -3826.8,
        "Product2_Name": "Xello for High School",
        "Description": "Kansas Pricing",
        "Quantity": 1063
    },
    {
        "Id": "00kI90000039tugIAA",
        "Account__r_Name": "Blue Valley North High School",
        "Name": "2023-JUL-N: Greenbush Southeast (Unified School) YR 1/3 Xello for High School",
        "OpportunityId": "006I9000002HxFOIA0",
        "StartDate__c": "2023-07-01T00:00:00",
        "EndDate__c": "2024-06-30T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": -5504.4,
        "Product2_Name": "Xello for High School",
        "Description": "Kansas Pricing",
        "Quantity": 1529
    },
    {
        "Id": "00kI90000039tuhIAA",
        "Account__r_Name": "Blue Valley Northwest High School",
        "Name": "2023-JUL-N: Greenbush Southeast (Unified School) YR 1/3 Xello for High School",
        "OpportunityId": "006I9000002HxFOIA0",
        "StartDate__c": "2023-07-01T00:00:00",
        "EndDate__c": "2024-06-30T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": -5691.6,
        "Product2_Name": "Xello for High School",
        "Description": "Kansas Pricing",
        "Quantity": 1581
    },
    {
        "Id": "00kI90000039tuiIAA",
        "Account__r_Name": "Blue Valley West High School",
        "Name": "2023-JUL-N: Greenbush Southeast (Unified School) YR 1/3 Xello for High School",
        "OpportunityId": "006I9000002HxFOIA0",
        "StartDate__c": "2023-07-01T00:00:00",
        "EndDate__c": "2024-06-30T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": -5860.8,
        "Product2_Name": "Xello for High School",
        "Description": "Kansas Pricing",
        "Quantity": 1628
    },
    {
        "Id": "00kI90000039tujIAA",
        "Account__r_Name": "Blue Valley High School",
        "Name": "2023-JUL-N: Greenbush Southeast (Unified School) YR 1/3 Xello for High School",
        "OpportunityId": "006I9000002HxFOIA0",
        "StartDate__c": "2023-07-01T00:00:00",
        "EndDate__c": "2024-06-30T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": -5338.8,
        "Product2_Name": "Xello for High School",
        "Description": "Kansas Pricing",
        "Quantity": 1483
    },
    {
        "Id": "00kI90000035TCqIAM",
        "Account__r_Name": "Sailorway Middle School",
        "Name": "2023-JUL-N: Vermilion High School Xello for Middle School",
        "OpportunityId": "006I9000002Wm7RIAS",
        "StartDate__c": "2023-07-01T00:00:00",
        "EndDate__c": "2024-06-30T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 1814.5,
        "Product2_Name": "Xello for Middle School",
        "Description": "Student license fees – includes unlimited consultation and support.",
        "Quantity": 382
    },
    {
        "Id": "00kI90000035TESIA2",
        "Account__r_Name": "Bridle Path Elementary School",
        "Name": "2023-SEP-N: North Penn School District Xello for Elementary School",
        "OpportunityId": "006I9000002WmEFIA0",
        "StartDate__c": "2023-09-01T00:00:00",
        "EndDate__c": "2024-08-31T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 1463,
        "Product2_Name": "Xello for Elementary School",
        "Description": "Student license fees – includes unlimited consultation and support.",
        "Quantity": 532
    },
    {
        "Id": "00kI90000035TETIA2",
        "Account__r_Name": "General F Nash Elementary School",
        "Name": "2023-SEP-N: North Penn School District Xello for Elementary School",
        "OpportunityId": "006I9000002WmEFIA0",
        "StartDate__c": "2023-09-01T00:00:00",
        "EndDate__c": "2024-08-31T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 1287,
        "Product2_Name": "Xello for Elementary School",
        "Description": "Student license fees – includes unlimited consultation and support.",
        "Quantity": 468
    },
    {
        "Id": "00kI90000035TEUIA2",
        "Account__r_Name": "Gwyn nor Elementary School",
        "Name": "2023-SEP-N: North Penn School District Xello for Elementary School",
        "OpportunityId": "006I9000002WmEFIA0",
        "StartDate__c": "2023-09-01T00:00:00",
        "EndDate__c": "2024-08-31T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 1595,
        "Product2_Name": "Xello for Elementary School",
        "Description": "Student license fees – includes unlimited consultation and support.",
        "Quantity": 580
    },
    {
        "Id": "00kI90000035TEVIA2",
        "Account__r_Name": "Gwynedd Square Elementary School",
        "Name": "2023-SEP-N: North Penn School District Xello for Elementary School",
        "OpportunityId": "006I9000002WmEFIA0",
        "StartDate__c": "2023-09-01T00:00:00",
        "EndDate__c": "2024-08-31T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 1556.5,
        "Product2_Name": "Xello for Elementary School",
        "Description": "Student license fees – includes unlimited consultation and support.",
        "Quantity": 566
    },
    {
        "Id": "00kI90000035TEWIA2",
        "Account__r_Name": "Hatfield Elementary School",
        "Name": "2023-SEP-N: North Penn School District Xello for Elementary School",
        "OpportunityId": "006I9000002WmEFIA0",
        "StartDate__c": "2023-09-01T00:00:00",
        "EndDate__c": "2024-08-31T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 1317.25,
        "Product2_Name": "Xello for Elementary School",
        "Description": "Student license fees – includes unlimited consultation and support.",
        "Quantity": 479
    },
    {
        "Id": "00kI90000032sCSIAY",
        "Account__r_Name": "El Paso Gridley High School",
        "Name": "2022-SEP-R-DS: El Paso Gridley CUSD 11 (Copy) Xello for High School",
        "OpportunityId": "006I9000002HPAyIAO",
        "StartDate__c": "2022-09-01T00:00:00",
        "EndDate__c": "2023-08-31T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 1400,
        "Product2_Name": "Xello for High School",
        "Description": null,
        "Quantity": 400
    },
    {
        "Id": "00kI90000032sCTIAY",
        "Account__r_Name": "El Paso Gridley Junior High School",
        "Name": "2022-SEP-R-DS: El Paso Gridley CUSD 11 (Copy) Xello for Middle School",
        "OpportunityId": "006I9000002HPAyIAO",
        "StartDate__c": "2022-09-01T00:00:00",
        "EndDate__c": "2023-08-31T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 300,
        "Product2_Name": "Xello for Middle School",
        "Description": null,
        "Quantity": 100
    },
    {
        "Id": "00kI90000035TEXIA2",
        "Account__r_Name": "Inglewood Elementary School",
        "Name": "2023-SEP-N: North Penn School District Xello for Elementary School",
        "OpportunityId": "006I9000002WmEFIA0",
        "StartDate__c": "2023-09-01T00:00:00",
        "EndDate__c": "2024-08-31T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 1463,
        "Product2_Name": "Xello for Elementary School",
        "Description": "Student license fees – includes unlimited consultation and support.",
        "Quantity": 532
    },
    {
        "Id": "00kI90000035TEYIA2",
        "Account__r_Name": "Knapp Elementary School",
        "Name": "2023-SEP-N: North Penn School District Xello for Elementary School",
        "OpportunityId": "006I9000002WmEFIA0",
        "StartDate__c": "2023-09-01T00:00:00",
        "EndDate__c": "2024-08-31T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 1647.25,
        "Product2_Name": "Xello for Elementary School",
        "Description": "Student license fees – includes unlimited consultation and support.",
        "Quantity": 599
    },
    {
        "Id": "00kI90000039bgPIAQ",
        "Account__r_Name": "Hiawatha Elementary School",
        "Name": "2024-JUL-R-PI: Greenbush Southeast (Hiawatha Middle) Xello for Elementary School",
        "OpportunityId": "006I9000002lDgcIAE",
        "StartDate__c": "2024-07-01T00:00:00",
        "EndDate__c": "2025-06-30T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 480.65,
        "Product2_Name": "Xello for Elementary School",
        "Description": "Kansas Pricing",
        "Quantity": 305
    },
    {
        "Id": "00kI90000039bgQIAQ",
        "Account__r_Name": "Advanced Technology Academy",
        "Name": "2024-SEP-R-PI: Advanced Technology Academy Xello for Elementary School",
        "OpportunityId": "006I9000002lDhwIAE",
        "StartDate__c": "2024-09-01T00:00:00",
        "EndDate__c": "2025-08-31T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 975.15,
        "Product2_Name": "Xello for Elementary School",
        "Description": "REMC Pricing",
        "Quantity": 541
    },
    {
        "Id": "00kI90000033IVVIA2",
        "Account__r_Name": "Mckinney Boyd High School",
        "Name": "2023-SEP-N: McKinney Independent School District Xello for High School",
        "OpportunityId": "006I9000002Jp10IAC",
        "StartDate__c": "2023-09-01T00:00:00",
        "EndDate__c": "2024-08-31T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 13577.85,
        "Product2_Name": "Xello for High School",
        "Description": "Student license fees – includes unlimited consultation and support.",
        "Quantity": 2743
    },
    {
        "Id": "00kI90000033IVWIA2",
        "Account__r_Name": "Mckinney High School",
        "Name": "2023-SEP-N: McKinney Independent School District Xello for High School",
        "OpportunityId": "006I9000002Jp10IAC",
        "StartDate__c": "2023-09-01T00:00:00",
        "EndDate__c": "2024-08-31T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 14731.2,
        "Product2_Name": "Xello for High School",
        "Description": "Student license fees – includes unlimited consultation and support.",
        "Quantity": 2976
    },
    {
        "Id": "00kI90000033IVXIA2",
        "Account__r_Name": "McKinney North High School",
        "Name": "2023-SEP-N: McKinney Independent School District Xello for High School",
        "OpportunityId": "006I9000002Jp10IAC",
        "StartDate__c": "2023-09-01T00:00:00",
        "EndDate__c": "2024-08-31T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 10746.45,
        "Product2_Name": "Xello for High School",
        "Description": "Student license fees – includes unlimited consultation and support.",
        "Quantity": 2171
    },
    {
        "Id": "00kI90000033IEeIAM",
        "Account__r_Name": "Sulphur Springs High School",
        "Name": "2022-NOV-R-PU: Sulphur Springs Independent School District Xello for High School",
        "OpportunityId": "006I9000002JuprIAC",
        "StartDate__c": "2022-11-01T00:00:00",
        "EndDate__c": "2023-10-31T00:00:00",
        "Contract_Duration__c": 1,
        "TotalPrice": 6266.7,
        "Product2_Name": "Xello for High School",
        "Description": "Student license fees – includes unlimited consultation and support.",
        "Quantity": 1266
    }
]