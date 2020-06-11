/* Class:       CCHttpCalloutMock
** Created by:  OpFocus (Veena Sundara-Heragu) on 07/26/2017
** Description: implements HttpCalloutMock interface and is to be used by unit tests for code that makes http callouts
*/
@isTest // so that it does not count towards our apex code limits
public class CCHttpCalloutMock  implements HttpCalloutMock 
{

	public Boolean blnReturnError {get; set;}

	public CCHttpCalloutMock() {
		this.blnReturnError = false;
	}

	public CCHttpCalloutMock(Boolean blnReturnError) {
		this.blnReturnError = blnReturnError;
	}

    // Implement this interface method
    public HTTPResponse respond(HTTPRequest req) {
        // Create a fake response
        
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        // added result outer object bfinn 12/12/2017
        // {"result" : {"success":"true","message":"XXX", "detail":""}, "Id":"000000000000000"}
        if (blnReturnError) {
			res.setBody('{"result":{"success":false,"message":"There was an error with your request.","detail":null},"Id":"a0Z4100000IKt3kEAD"}');
    	} else {
			res.setBody('{"result":{"success":true,"message":"Everything is good","detail":null},"Id":"a0Z4100000IKt3kEAD"}');
    	}
        res.setStatusCode(200);
        return res;
    }

}