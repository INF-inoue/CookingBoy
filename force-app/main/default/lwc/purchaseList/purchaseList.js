import { publish, MessageContext } from 'lightning/messageService';
import Material_LIST_UPDATE_MESSAGE from '@salesforce/messageChannel/MaterialListUpdate__c';
import { NavigationMixin } from 'lightning/navigation';
import { LightningElement, api, wire } from 'lwc';

// lightning appのWindowを閉じる用
import { CloseActionScreenEvent } from 'lightning/actions';

// 開いているページのレコードを取得する
import { getRecord } from 'lightning/uiRecordApi';

// ApexのMethod
import getMissingList from '@salesforce/apex/MissingMaterialList.getMissingMaterials'
import setMaterial from '@salesforce/apex/MaterialController.setRecord'

export default class puchaseList extends NavigationMixin(LightningElement) {
    searchRange;
    materialList;

// searchTermが更新されたらApexからデータを取得する
    @wire(getMissingList, {searchRange: '$searchRange'})
    loadMaterial({data, error}) {
        if (data) {
            this.materialList = data;
        } else if(error) {
            console.log("error === " + error);
        }
    }

    // 検索フィールドに入力された値をsearchTermに格納する。
    handleSearchRangeChange(event) {
        window.clearTimeout(this.delayTimeout);
        const searchRange = event.target.value;

        console.log(searchRange);

        this.delayTimeout = setTimeout(() => {
			this.searchRange = searchRange;
		}, 300);
    }

    // // 追加ボタンを押された時の処理
    // handleClick() {
        
    //     // データテーブルの選択した行データを取得する
    //     var el = this.template.querySelector("lightning-datatable");
    //     var selectedRecords = el.getSelectedRows();

    //     // 画面を閉じる
    //     this.dispatchEvent(new CloseActionScreenEvent());

    //     // 正しくJSON形式に変換するために配列に格納
    //     var param = [];
    //     for (let key in selectedRecords) {
    //         param.push(selectedRecords[key]);
    //     }

    //     // JSONデータとレコードIdをAPEXに渡す。
    //     setMaterial({param : JSON.stringify(param), recipeId : this.recordId});
        
    //     // ページを更新して作成されたデータを表示させる。
    //     location.reload();
    // }

    // // キャンセルボタンを押された時の処理
    // cancelClick() {
    //     // 画面を閉じる
    //     this.dispatchEvent(new CloseActionScreenEvent());
    // }  
}