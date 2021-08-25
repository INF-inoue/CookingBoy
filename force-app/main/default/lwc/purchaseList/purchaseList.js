// 画面繊維昨日の拡張らしい・・・。
import { NavigationMixin } from 'lightning/navigation';
import { LightningElement, wire } from 'lwc';

// ApexのMethod
import getMissingList from '@salesforce/apex/MissingMaterialList.getMissingMaterials'
import setMissMatRecords from '@salesforce/apex/MissingMaterialList.setMissMatRecords'

export default class puchaseList extends NavigationMixin(LightningElement) {
    // 強を基準に何日後のレシピまで材料を取得するか
    searchRange = 2;

    // Apexからのデータを取得する変数
    materialList;

    // 購入数量をhtmlから取得して、{材料ID: 購入数量}を取得
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

    // 材料データの取得範囲の取得
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
        
        // ページを更新して更新後のデータを表示させる。
        location.reload();
    }

    // htmlのIDはデプロイして表示される際に変更され、
    // 配列でデータを取得するのができないので
    // 登録ボタンを押したタイミングではなく、変更イベントからデータを取得します。
    handleChange(event){

        // inputboxのデータを取得します。
        let cont = Number(event.target.value);

        // inputboxのIDを取得します。
        let key = event.target.id;

        // IDの変更は、指定したIDの前が変更されることはない(と思っている)ので
        // IDの部分の18桁を取得。(IDじゃなくて、NameやTitleにすればいいのか・・・。)
        key = key.slice(0, 18);
        
        //IDをキーに購入数量を登録します。
        this.PurchaseQuantity[key] = cont;
    }

    // // キャンセルボタンを押された時の処理
    // cancelClick() {
    //     // 画面を閉じる
    //     this.dispatchEvent(new CloseActionScreenEvent());
    // }  
}