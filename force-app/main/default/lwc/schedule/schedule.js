import { LightningElement, wire } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
// トースト機能を使用できる様にする。（保存時に出力されるメッセージのイベント）
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import SCHEDULE_ID from '@salesforce/schema/Schedule__c.Id';
import SCHEDULE_FLAG from '@salesforce/schema/Schedule__c.CreateFlag__c';

import getSchedule from '@salesforce/apex/ScheduleController.getSchedule';
// import setCreateFlag from '@salesforce/apex/ScheduleController.setCreateFlag';

const wd = ['日', '月', '火', '水', '木', '金', '土'];

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

    @wire(getSchedule, {formDate: '$formDate'})
    loadMaterial({data, error}) {
        if(data) {
            let d = [];
            for(let i = 0; i < 14; i++) {
                d.push({
                    data:data[i],
                    date:this.dates[i]
                });
            }

            this.dataRange = d.slice(3, 10);
            this.data = d;
        } else if(error) {
            console.log("error === " + error);
        }
    }

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

        this.formDate = [
            refDate.getFullYear(), 
            refDate.getMonth() + 1 ,
            refDate.getDate() + 1
        ];
    }

    constructor() {
        super();
        
        let refDate = new Date();
        refDate.setDate(refDate.getDate() - 5);

        this.getWeek(refDate);
    }

    handleClick(event) {
        this.dateRangeNum += Number(event.target.value);
        let i = this.dateRangeNum;
        
        this.beforRengeFlag = (i <= -3);
        this.afterRengeFlag = (i >= 3);
        
        this.dataRange = this.data.slice(3 + i, 10 + i);
        // this.dateRange = this.dates.slice(3 + i, 10 + i);
    }
    

    getTrimDate(refDate) {
        let m = refDate.getMonth() + 1;
        let d = refDate.getDate();
        let w = wd[refDate.getDay()];

        return m + '/' + d + '(' + w + ')';
    }

    handleClickApply(event) {

        this.scheduleId = event.target.value;
        // レコード情報格納用
        const fields = {};
        // 取得した取引先のIDを更新用の変数へ格納
        fields[SCHEDULE_ID.fieldApiName] = this.scheduleId;

        // 取得した取引先のIDを更新用の変数へ格納
        fields[SCHEDULE_FLAG.fieldApiName] = true;
        
        const recordInput = { fields };

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

    gotoRecodePage(event) {
        let recodeID = event.target.name;

        console.log(recodeID);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recodeID,
                objectApiName: 'Recipe__c',
                actionName: 'view'
            }
        })
    }

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