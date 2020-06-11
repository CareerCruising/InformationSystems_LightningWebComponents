@isTest
public with sharing class TestGraphicsPackController {
    
    @isTest
    public static void testcreateImageMaps(){
        GraphicsPackController gp = new GraphicsPackController();
        gp.createImageMaps();
        System.assert(gp.mapflags16Images.keySet().size() > 0);
    }

    @isTest
    public static void testgetGraphicSizeOptions(){
        GraphicsPackController gp = new GraphicsPackController();
        List<SelectOption> opts = gp.getGraphicSizeOptions();
        System.assert(opts.size() > 0);      
    }
    
    @isTest
    public static void testgetGraphicsPackSetting(){
        GraphicsPackController gp = new GraphicsPackController();
        Map<String,GraphicsPackSettings__mdt> setting = gp.getGraphicsPackSetting();
        System.assert(setting.keySet().size() > 0); 
    }
}