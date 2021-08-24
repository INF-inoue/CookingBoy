public with sharing class MaterialController {
    @AuraEnabled(cacheable=true)
    public static Material__c[] getAllMaterials() {
        return [
            SELECT Id, Name, MaterialClassification__c
            FROM Material__c
            ORDER BY Name
        ];
    }
	
    @AuraEnabled(cacheable=true)
    public static List<Material__c> getRecord(String searchTerm) {
        searchTerm = searchTerm.trim();


        if(searchTerm == '') {
            return getAllMaterials();
        }

        searchTerm = '%' + searchTerm + '%';

        return [
            SELECT Id, Name, MaterialClassification__c
            FROM Material__c
            WHERE Name LIKE :searchTerm
            ORDER BY Name
        ];   
    }
    
    @AuraEnabled
	public static void setRecord(String param, String recipeId) {
        SetRecipeMaterial.setRecipeMaterial(param, recipeId);
    }
}