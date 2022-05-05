@isTest
private class EmailTest {
    @isTest static void sendEmailTest(){
        String subject = 'Test Email';
        String body = 'This is the email body';
        List<String> toAddress = new List<String>();
        toAddress.add('anthonya@xello.world');
        toAddress.add('anthony@theabbotthome.com');
        Email.sendEmail(toAddress, subject, body); 
        //System.assertEquals(result.Error,'');
    } 
}