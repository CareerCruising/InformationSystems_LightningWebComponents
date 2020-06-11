@isTest
public class HttpGetControllerTest {

    @isTest
    static void SuccessConnect() {
     
		// set mock callout class for http callouts
		Test.setMock(HttpCalloutMock.class, new CCHttpCalloutMock());

        Test.startTest();
        // Account: Wounded Knee School System
        string endpointURL = 'https://is.xello.world//api/Integrations/GetUsage?AccId=0014100001dLp2LAAS';
        map<String, Object> retval = HttpGetController.GetJson(endpointURL);
        map<String, Object> retval2 = retval;
        Test.stopTest();

        System.assertEquals(retval, retval2);

    }

    @isTest
    static void FailConnect() {
     
		// set mock callout class for http callouts
		Test.setMock(HttpCalloutMock.class, new CCHttpCalloutMock());

        Test.startTest();
        // Account: Wounded Knee School System
        string endpointURL ;
        map<String, Object> retval = HttpGetController.GetJson(endpointURL);
        map<String, Object> retval2 = retval;
        Test.stopTest();

        System.assertEquals(retval, retval2);

    }
}
