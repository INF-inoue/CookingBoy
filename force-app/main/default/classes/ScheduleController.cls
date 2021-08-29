public with sharing class ScheduleController {
    @AuraEnabled(cacheable=true)
    public static Map<Integer, List<Recipe__c>> getSchedule(List<Integer> formDate) {  
        // 数値リストから日付を作成
        Date refDate = Date.newInstance(formDate[0], formDate[1], formDate[2]);
        // Integer sDOfW = getDayOfWeekCode(refDate);

        // 受けた日付から14日分のスケジュールを取得
        List<Schedule__c> schedule = [
            SELECT Scheduled__c, Recipe__c, AmountToCreate__c, CreateFlag__c
            FROM Schedule__c
            WHERE Scheduled__c >= :refDate AND Scheduled__c <= :refDate.addDays(14)
        ];

        // スケジュールにあるレシピのIDリストを作成
        List<Id> recipeId = new List<Id>();
        for(Schedule__c s : schedule) {
            if(!recipeId.contains(s.Recipe__c)) {
                recipeId.add(s.Recipe__c);
            }
        }

        // IDリストからレシピオブジェクトを取得
         Map<Id, Recipe__c> mapRecipe = new Map<Id, Recipe__c>([
            SELECT Id, Name, CompImage__c, ScheduleID__c
            FROM Recipe__c
            WHERE Id IN :recipeId
        ]);

        // 戻り値用のネストListを作成
        // 曜日に対して、レシピのリストを格納する(2品以上ある可能性を考慮)
        Map<Integer, List<Recipe__c>> dateToRecipe = new Map<Integer, List<Recipe__c>>();
        for(Integer i = 0; i < 14; i ++) {
            dateToRecipe.put(i, new List<Recipe__c>());
        }
        
        // 一時的にデータを保管する用の変数を作成

        Date d;
        Integer i;
        
        
        // 戻り値として、曜日コードとレシピリストを返却
        for(Schedule__c sche : schedule) {
            d = sche.Scheduled__c;
            i = refDate.daysBetween(d);
            // dOfw = getDayOfWeekCode(d) - sDOfW;
            // if(dOfw < 0) {
            //     dOfw += 7;
            // }

            dateToRecipe.get(i).add(mapRecipe.get(sche.Recipe__c));
            /*
            dateToRecipe[i].Id = r.Id;
            dateToRecipe[i].Name = r.Name;
            dateToRecipe[i].CompImage__c = r.CompImage__c;
            // getImageFromRichTextAria(r.CompImage__c);
            dateToRecipe[i].CreateFlag__c = sche.CreateFlag__c;
            dateToRecipe[i].ScheduleID__c = sche.Id;
			*/
        }

        return dateToRecipe;
    }
    
    // private static Integer getDayOfWeekCode(Date d) {
        
    //     Datetime dt = datetime.newInstance(d.year(), d.month(), d.day());
        
    //     String e = dt.format('E');
    //     switch on e {
    //         when 'Sun' {
    //             return 0;
    //         }
    //         when 'Mon' {
    //             return 1;
    //         }
    //         when 'Tue' {
    //             return 2;
    //         }
    //         when 'Wed' {
    //             return 3;
    //         }
    //         when 'Thu' {
    //             return 4;
    //         }
    //         when 'Fri' {
    //             return 5;
    //         }
    //         when 'Sat' {
    //             return 6;
    //         }
    //     }
    //     return null;
    // }

    // @AuraEnabled
    // public static String setCreateFlag(String ScheduleID) {
    //     System.debug(ScheduleID);
    //     String a = ScheduleComp.applyCreateFlag(ScheduleID);
    //     System.debug(a);
    //     return a;
    // }

}