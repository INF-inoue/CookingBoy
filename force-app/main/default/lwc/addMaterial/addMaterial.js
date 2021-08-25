
//＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠
// 検索時の挙動がおかしいので、未完成です。。。
//＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠＠

import { publish, MessageContext } from 'lightning/messageService';
import Material_LIST_UPDATE_MESSAGE from '@salesforce/messageChannel/MaterialListUpdate__c';
import { NavigationMixin } from 'lightning/navigation';
import { LightningElement, api, wire } from 'lwc';

// lightning appのWindowを閉じる用
import { CloseActionScreenEvent } from 'lightning/actions';

// 開いているページのレコードを取得する
import { getRecord } from 'lightning/uiRecordApi';

// ApexのMethod
import searchMaterial from '@salesforce/apex/MaterialController.getRecord'
import setMaterial from '@salesforce/apex/MaterialController.setRecord'

// datatableの項目名を設定
const columns = [
    { label: '材料名', fieldName: 'Name' },
    { label: '材料区分', fieldName: 'MaterialClassification__c'},
];

export default class BasicDatatable extends NavigationMixin(LightningElement) {

    // 検索値の変数
    searchTerm = '';

    // datatableに表示するデータの変数
    data = [];

    // datatableの項目の変数
    columns = columns;

    // ページのレコードID用の変数
    @api recordId;

    // ページのレコードIDを取得
	@wire(getRecord, { recordId: '$recordId' })Recipe__c;

    // メッセージテキストを取得
    @wire(MessageContext) messageContext;

    // searchTermが更新されたらApexからデータを取得する
    @wire(searchMaterial, {searchTerm: '$searchTerm'})
    loadMaterial(result) {
        this.data = result;
        if (result.data) {
            const message = {
                materials: result.data
            };
            publish(this.messageContext, Material_LIST_UPDATE_MESSAGE, message);
        }
    }

    // 検索フィールドに入力された値をsearchTermに格納する。
    handleSearchTermChange(event) {
        window.clearTimeout(this.delayTimeout);
        const searchTerm = event.target.value;

        this.delayTimeout = setTimeout(() => {
			this.searchTerm = searchTerm;
		}, 300);
    }

    // 追加ボタンを押された時の処理
    handleClick() {
        
        // データテーブルの選択した行データを取得する
        var el = this.template.querySelector("lightning-datatable");
        var selectedRecords = el.getSelectedRows();

        // 画面を閉じる
        this.dispatchEvent(new CloseActionScreenEvent());

        // 正しくJSON形式に変換するために配列に格納
        var param = [];
        for (let key in selectedRecords) {
            param.push(selectedRecords[key]);
        }

        // JSONデータとレコードIdをAPEXに渡す。
        setMaterial({param : JSON.stringify(param), recipeId : this.recordId});
        
        // ページを更新して作成されたデータを表示させる。
        location.reload();
    }

    // キャンセルボタンを押された時の処理
    cancelClick() {
        // 画面を閉じる
        this.dispatchEvent(new CloseActionScreenEvent());
    }  
}