public with sharing class GraphicsPackController {
    public Map<String, List<GraphicsPackImages__mdt>> mapflags16Images{get;set;}
    public Map<String, List<GraphicsPackImages__mdt>> mapsilk16Images{get;set;}
    public Map<String, List<GraphicsPackImages__mdt>> mapfatcow16Images{get;set;}
    public Map<String, List<GraphicsPackImages__mdt>> mapfatcow32Images{get;set;}
    public Map<String, List<GraphicsPackImages__mdt>> mapvpharm16Images{get;set;}
    public Map<String, List<GraphicsPackImages__mdt>> mapvpharm32Images{get;set;}
    public Map<String, List<GraphicsPackImages__mdt>> maptango16Images{get;set;}
    public Map<String, List<GraphicsPackImages__mdt>> maptango32Images{get;set;}
    public Map<String, List<GraphicsPackImages__mdt>> mapiconshock16Images{get;set;}
    public Map<String, List<GraphicsPackImages__mdt>> mapiconshock32Images{get;set;}
    public String graphicSize{get;set;}
    
    public GraphicsPackController(){
        mapflags16Images = new Map<String, List<GraphicsPackImages__mdt>>();
        mapsilk16Images = new Map<String, List<GraphicsPackImages__mdt>>();
        mapfatcow16Images = new Map<String, List<GraphicsPackImages__mdt>>();
        mapfatcow32Images = new Map<String, List<GraphicsPackImages__mdt>>();
        mapvpharm16Images = new Map<String, List<GraphicsPackImages__mdt>>();
        mapvpharm32Images = new Map<String, List<GraphicsPackImages__mdt>>();
        maptango16Images = new Map<String, List<GraphicsPackImages__mdt>>();
        maptango32Images = new Map<String, List<GraphicsPackImages__mdt>>();
        mapiconshock16Images = new Map<String, List<GraphicsPackImages__mdt>>();
        mapiconshock32Images = new Map<String, List<GraphicsPackImages__mdt>>();
        graphicSize = '16';
        createImageMaps();            
    }
    
    public List<SelectOption> getGraphicSizeOptions(){
        List<SelectOption> lstSizeOptions = new List<SelectOption>();
        lstSizeOptions.add(new SelectOption('16', '16px'));
        lstSizeOptions.add(new SelectOption('32', '32px'));
        return lstSizeOptions;                                                          
    }

    public Map<String, List<GraphicsPackImages__mdt>> createImageMap(Map<String, List<GraphicsPackImages__mdt>> imageMap, GraphicsPackImages__mdt image){
        List<GraphicsPackImages__mdt> templist = new List<GraphicsPackImages__mdt>();
        templist.add(image);
        if(imageMap.containsKey(image.Type__c)){
            templist.addAll(imageMap.get(image.Type__c));
            imageMap.put(image.Type__c, templist);
        }else{
            imageMap.put(image.Type__c, templist);    
        }
        return imageMap;        
    }
     
    public void createImageMaps(){
        try{
            List<GraphicsPackImages__mdt> lstImages = new List<GraphicsPackImages__mdt>();
            lstImages = [SELECT  Id,
                                 DeveloperName,
                                 Label,
                                 Image_URL__c,
                                 Graphic_Setting_ID__c,
                                 Type__c
                             FROM GraphicsPackImages__mdt ORDER BY Graphic_Setting_ID__c  LIMIT 2000];
            
            for(GraphicsPackImages__mdt image : lstImages){
                if(image.Graphic_Setting_ID__c == 'flags16'){
                    mapflags16Images = createImageMap(mapflags16Images, image);            
                }else if(image.Graphic_Setting_ID__c == 'silk16'){
                    mapsilk16Images = createImageMap(mapsilk16Images, image);  
                }else if(image.Graphic_Setting_ID__c == 'fatcow16'){
                    mapfatcow16Images = createImageMap(mapfatcow16Images, image); 
                }else if(image.Graphic_Setting_ID__c == 'fatcow32'){
                    mapfatcow32Images = createImageMap(mapfatcow32Images, image); 
                }else if(image.Graphic_Setting_ID__c == 'visualpharm16'){
                    mapvpharm16Images = createImageMap(mapvpharm16Images, image); 
                }else if(image.Graphic_Setting_ID__c == 'visualpharm32'){
                    mapvpharm32Images = createImageMap(mapvpharm32Images, image); 
                }else if(image.Graphic_Setting_ID__c == 'tangodesktopproject16'){
                    maptango16Images = createImageMap(maptango16Images, image); 
                }else if(image.Graphic_Setting_ID__c == 'tangodesktopproject32'){
                    maptango32Images = createImageMap(maptango32Images, image); 
                }else if(image.Graphic_Setting_ID__c == 'iconshock16'){
                    mapiconshock16Images = createImageMap(mapiconshock16Images, image); 
                }else if(image.Graphic_Setting_ID__c == 'iconshock32'){
                    mapiconshock32Images = createImageMap(mapiconshock32Images, image); 
                }         
            }
         }catch(exception ex){
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.Error, 'Error Occured displaying images'));
        }           
    }
    
    public Map<String, GraphicsPackSettings__mdt> getGraphicsPackSetting(){
        List<GraphicsPackSettings__mdt> lstsettings = new List<GraphicsPackSettings__mdt>();
        Map<String, GraphicsPackSettings__mdt> mapSetting = new Map<String, GraphicsPackSettings__mdt>();
        try{
            lstsettings =  [SELECT Id,
                                 Label,
                                 DeveloperName,
                                 Size__c,
                                 License__c,
                                 License2__c,
                                 LicenseURL__c,
                                 AttributionText__c,
                                 AttributionURL__c
                             FROM GraphicsPackSettings__mdt];
             
             for(GraphicsPackSettings__mdt setting : lstsettings){
                 mapSetting.put(setting.DeveloperName, setting);    
             }
             if(mapSetting.keySet().size() > 0){
                 return mapSetting;
             }else{
                 return null;
             }
             
         }catch(Exception ex){
             ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.Error, 'Error Occured displaying images'));
             return null;
         }   
    }
}