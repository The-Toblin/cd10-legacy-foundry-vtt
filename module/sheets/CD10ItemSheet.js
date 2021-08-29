export default class CD10ItemSheet extends ItemSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 560,
            height: 380,
            classes: ["cd10", "sheet", "item"]
        });

    }

    get template() {
        return `systems/cd10/templates/sheets/${this.item.data.type}-sheet.hbs`;
    }

    getData() {
        let sheetData = super.getData();
        sheetData.config = CONFIG.cd10;
        sheetData.data = sheetData.data.data
        return sheetData;
    }
}