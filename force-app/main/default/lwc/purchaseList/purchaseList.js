import { NavigationMixin } from 'lightning/navigation';
import { LightningElement, api, wire } from 'lwc';

// ApexのMethod
import getMissingList from '@salesforce/apex/MissingMaterialList.getMissingMaterials'
import setMissMatRecords from '@salesforce/apex/MissingMaterialList.setMissMatRecords'

export default class puchaseList extends NavigationMixin(LightningElement) {
    searchRange = 2;
    materialList;
    PurchaseQuantity = {};

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

        this.delayTimeout = setTimeout(() => {
            this.searchRange = searchRange;
        }, 300);
    }

    // 追加ボタンを押された時の処理
    applyWarehousing() {
        // 正しくJSON形式に変換するために配列に格納
        let PurchaseQuantity = this.PurchaseQuantity;

        // JSONデータとレコードIdをAPEXに渡す。
        setMissMatRecords({PurchaseQuantity : JSON.stringify(PurchaseQuantity)});
        
        // ページを更新して作成されたデータを表示させる。
        location.reload();
    }

    handleChange(event){
        let cont = Number(event.target.value);
        let key = event.target.id;
        key = key.slice(0, 18);
        
        this.PurchaseQuantity[key] = cont;
    }

    // // キャンセルボタンを押された時の処理
    // cancelClick() {
    //     // 画面を閉じる
    //     this.dispatchEvent(new CloseActionScreenEvent());
    // }  
}