const spellLists = {};
let selectedSpellList;

function saveKey(key) {
    const res = { // update whenever I add something else to save
        spellLists,
        selectedFilters,
    }[key] || {};
    localStorage.setItem("spellList-"+key, JSON.stringify(res));
}

function loadKey(key) {
    return JSON.parse(("["+localStorage.getItem("spellList-"+key)+"]") || "[]")[0];
}

function loadAllKeys() {
    const loadedFilters = loadKey("selectedFilters");
    if (loadedFilters) {
        for (const key in loadedFilters) {
            selectedFilters[key] = loadedFilters[key];
        }
    }
    const loadedLists = loadKey("spellLists");
    if (loadedLists) {
        let listOptions = "";
        for (const key in loadedLists) {
            spellLists[key] = loadedLists[key];
            listOptions += `<option>${key}</option>`;
        }
        document.getElementById("spellListSelect").innerHTML += listOptions;
    }
    selectedSpellList = location.href.split("?")[1];
    if (selectedSpellList) selectedSpellList = selectedSpellList.split("#")[0];
    if (!(selectedSpellList in spellLists)) selectedSpellList = undefined;
}