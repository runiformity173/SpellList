const spellLists = {};
const loadedSpellLists = {};
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
    let listOptions = "";
    if (loadedLists) {
        for (const key in loadedLists) {
            spellLists[key] = loadedLists[key];
            listOptions += `<option>${loadedLists[key].name}</option>`;
        }
    }
    listOptions += "<option>New List</option>";
    document.getElementById("spellListSelect").innerHTML += listOptions;
    selectedSpellList = location.href.split("?")[1];
    if (selectedSpellList) selectedSpellList = selectedSpellList.split("#")[0];
    if (!(selectedSpellList in spellLists)) {
        selectedSpellList = undefined;
        document.getElementById("listAddOptionEl").disabled = true;
    } else {
        const spellObjectReferences = [];
        const spellSet = new Set(spellLists[selectedSpellList].spells);
        const orderedSpells = [];
        for (const spell of spells) {
            const spellName = getNameForSpell(spell,concise=false);
            if (spellSet.has(spellName)) {
                spellObjectReferences.push(spell);
                orderedSpells.push(spellName);
            }
        }
        loadedSpellLists[selectedSpellList] = spellObjectReferences;
        spellLists[selectedSpellList].spells = orderedSpells;
        document.getElementById("spellListSelect").value = spellLists[selectedSpellList].name;
    }
}