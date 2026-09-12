let listMode = "View List";
function selectAllCheckbox(val) {
    if (val) {
        if (confirm("Are you sure you want to add all of these to the current spell list?")) {
            
        }
    }
}
function setSpellInList(spellName,toggle) {
    let targetList;
    if (listMode == "View List") {
        targetList = spellLists[selectedSpellList].prepared;
    } else if (listMode == "Edit List") {
        targetList = spellLists[selectedSpellList].spells;
    }
    if (toggle) {
        targetList.push(spellName);
        if (listMode == "Edit List") loadedSpellLists[selectedSpellList].push(getSpellByName(spellName));
    } else {
        const removedIndex = targetList.indexOf(spellName);
        if (listMode == "Edit List") loadedSpellLists[selectedSpellList].splice(removedIndex,1);
        targetList.splice(removedIndex,1);
    }
    saveKey("spellLists");
}
function setViewMode(val) {
    listMode = val;
    loadSpells();
}
function selectSpellList(newListName) {
    if (newListName == "All Spells") {
        window.location.replace(window.location.href.split("?")[0].split("#")[0] + (window.location.hash || ""));
        return;
    }
    if (newListName == "New List") {
        const newName = prompt("Name the new spell list:");
        if (!newName) {
            document.getElementById("spellListSelect").value = spellLists[selectedSpellList]?.name || "All Spells";
            return;
        }
        const newNameNorm = newName.toLowerCase().replaceAll(" ","-");
        if (newNameNorm in spellLists) {
            alert("A spell list with that name already exists.");
            document.getElementById("spellListSelect").value = spellLists[selectedSpellList]?.name || "All Spells";
            return;
        }
        spellLists[newNameNorm] = { // default spell list object
            name: newName,
            spells: [],
            prepared: [],
            maxPrepared: 0,
        }
        saveKey("spellLists");
        let newUrl = "?"+newNameNorm;
        newUrl += window.location.hash || "";
        window.location.replace(newUrl);
        return;
    }
    let newUrl = "?"+newListName.toLowerCase().replaceAll(" ","-");
    newUrl += window.location.hash || "";
    window.location.replace(newUrl);
}