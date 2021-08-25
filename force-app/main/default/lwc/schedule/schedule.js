import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
// トースト機能を使用できる様にする。（保存時に出力されるメッセージのイベント）
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// Update, UpsertがApexでできなかったので、JSから実施するために、
// 項目を取得できるようにしました。
import SCHEDULE_ID from '@salesforce/schema/Schedule__c.Id';
import SCHEDULE_FLAG from '@salesforce/schema/Schedule__c.CreateFlag__c';

// レコードをアップデートするAPI
import { updateRecord } from 'lightning/uiRecordApi';

// スケジュールを取得するApexからメソッド
import getSchedule from '@salesforce/apex/ScheduleController.getSchedule';

// ApexからレコードをUpdateするために準備したメソッド
// import setCreateFlag from '@salesforce/apex/ScheduleController.setCreateFlag';

// 曜日コードに対応した曜日の日本語表記
const wd = ['日', '月', '火', '水', '木', '金', '土'];

// 度重なるアップデートにより、余計なプロセスを経ている部分があります。
// あらかじめご了承ください。


export default class Schedule extends NavigationMixin(LightningElement) {
    formDate;
    dates;
    dateRange;
    data;
    dataRange;
    createFlag;
    dateRangeNum = 0;
    beforRengeFlag;
    afterRengeFlag;
    ScheduleID;

    // formDateが更新されたときに、Apexのメソッドを実行してデータを取得します。
    // ちなみに({data, error})を(result)にすると、JS内で変数を操作できないです。
    // teratailに質問投稿して、自己解決しました。
    // https://teratail.com/questions/355510#reply-485975
    @wire(getSchedule, {formDate: '$formDate'})
    loadMaterial({data, error}) {
        // dataがあるとき
        if(data) {
            let d = [];
            // htmlに渡せるようにデータを成形します。
            for(let i = 0; i < 14; i++) {
                d.push({
                    data:data[i],
                    date:this.dates[i]
                });
            }

            // 成形後のデータをインスタンス変数？に保存します。
            this.data = d;

            // スケジュールに表示する7件をApexから取得したデータから
            // ピックアップします。
            // 最初は今日を基準に1日前から1週間分が表示されます。
            this.dataRange = d.slice(3, 10);
        } else if(error) {
            // エラー時のデータが出力されます。
            console.log("error === " + error);
        }
    }

    // 今日を基準に日付範囲を取得します。
    getWeek(refDate) {
        let dates = [];
        let trimDate;
        for(let i = 1; i <= 14; i ++) {
            refDate.setDate(refDate.getDate() + 1);
            trimDate = this.getTrimDate(refDate);
            dates.push(trimDate);
        }

        refDate.setDate(refDate.getDate() - 14);

        this.dates = dates;
        this.dateRange = dates.slice(3, 10);

        // 年月日を配列形式でAPEXに渡す。
        this.formDate = [
            refDate.getFullYear(), 
            refDate.getMonth() + 1 ,
            refDate.getDate() + 1
        ];
    }

    // 初期設定
    constructor() {
        super();
        
        // 今日の日付を取得して、5日前の日付をgetweekに渡す。
        let refDate = new Date();
        refDate.setDate(refDate.getDate() - 5);

        this.getWeek(refDate);
    }

    // 前へ、後へのボタンを押されたときの処理
    handleClick(event) {
        // dateRangeNumに変更後のスケジュール範囲を取得
        this.dateRangeNum += Number(event.target.value);
        let i = this.dateRangeNum;
        
        // iが持っているデータ範囲がデータ以上、以下になった時に
        // ボタンが消えるようにflagを設定
        this.beforRengeFlag = (i <= -3);
        this.afterRengeFlag = (i >= 3);
        
        // スケジュールの表示範囲を変更
        this.dataRange = this.data.slice(3 + i, 10 + i);
        // this.dateRange = this.dates.slice(3 + i, 10 + i);
    }
    
    // 取得した日付を表示できるフォームにトリム
    getTrimDate(refDate) {
        let m = refDate.getMonth() + 1;
        let d = refDate.getDate();
        let w = wd[refDate.getDay()];

        return m + '/' + d + '(' + w + ')';
    }

    // 完了ボタンを押したときのflag処理
    handleClickApply(event) {

        // スケジュールIDを取得
        this.scheduleId = event.target.value;
        // レコード情報格納用
        const fields = {};
        // 取得したスケジュールのIDを更新用の変数へ格納
        fields[SCHEDULE_ID.fieldApiName] = this.scheduleId;

        // 完了のフラグをtrueにする
        fields[SCHEDULE_FLAG.fieldApiName] = true;
        
        const recordInput = { fields };

        // アップデートの処理を実行して処理結果を表示
        updateRecord(recordInput)
            .then(()=> {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: '成功',
                        message: 'スケジュール Id ' + this.scheduleId + '更新',
                        variant: '成功',
                    }),
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: '更新失敗',
                        message: error.body.message,
                        variant: '失敗',
                    }),
                );
            });
        location.reload();
    }

    // レコードページへ
    gotoRecodePage(event) {
        let recodeID = event.target.name;

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recodeID,
                objectApiName: 'Recipe__c',
                actionName: 'view'
            }
        })
    }

    // 新しいスケジュールページ
    // デフォルトの値を設定する方法をご存じでしたら教えてください。
    gotoNewSchedulePage() {
        // Opens the new Account record modal
        // to create an Account.
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Schedule__c',
                actionName: 'new'
            }
        });
    }

    // @wire(setCreateFlag, {ScheduleID: '$ScheduleID', fields: [SCHEDULE_FLAG]})
    // schedule__cRecord({data, error}) {
    //     if(data) {
    //         this.createFlag = data.fields.Schedule__c.CreateFlag__c;
    //     } else if(error){
    //         // 取得した際にエラーが発生した場合にコンソールにエラーを出力
    //         console.log("error === " + error);
    //     }
    // }


}