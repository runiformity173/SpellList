let listMode = "View List";
function selectAllCheckbox(val) {
    if (listMode == "Edit List") {
        if (confirm(`Are you sure you want to ${val ? "add" : "remove"} all of these ${val ? "to" : "from"} the current spell list?`)) {
            for (const spell of filterSpells(returnVal=true)) {
                const spellName = getNameForSpell(spell,concise=false);
                setSpellInList(spellName,val,save=false);
                document.getElementById("checkbox-"+spellName).checked = val;
            }
            saveKey("spellLists");
        }
    } else {
        if (confirm(`Are you sure you want to ${val ? "prepare" : "unprepare"} all of these spells?`)) {
            for (const spell of filterSpells(returnVal=true)) {
                const spellName = getNameForSpell(spell,concise=false);
                setSpellInList(spellName,val,save=false);
                document.getElementById("checkbox-"+spellName).checked = val;
            }
            saveKey("spellLists");
        }
    }
}
function reevaluateSelectAllChecked() {
    let anyChecked = false;
    let anyUnchecked = false;
    for (const el of document.querySelectorAll("#spellOptions .list-group-item input[type=checkbox]")) {
        if (el.closest(".list-group-item").style.display == "none") continue;
        if (el.checked) anyChecked = true;
        else anyUnchecked = true;
    }
    if (anyChecked && !anyUnchecked) {
        document.getElementById("selectAllCheckbox").checked = true;
    } else if (anyUnchecked) {
        document.getElementById("selectAllCheckbox").checked = false;
    }
}
function setSpellInList(spellName,toggle,save=true) {
    let targetList;
    if (listMode == "View List") {
        targetList = spellLists[selectedSpellList].prepared;
    } else if (listMode == "Edit List") {
        targetList = spellLists[selectedSpellList].spells;
    }
    if (toggle) {
        if (targetList.includes(spellName)) return; // already in list
        targetList.push(spellName);
        if (listMode == "Edit List") loadedSpellLists[selectedSpellList].push(getSpellByName(spellName));
    } else {
        const removedIndex = targetList.indexOf(spellName);
        if (removedIndex == -1) return; // not in list, so don't remove it
        if (listMode == "Edit List") loadedSpellLists[selectedSpellList].splice(removedIndex,1);
        targetList.splice(removedIndex,1);
    }
    if (save) saveKey("spellLists");
}
function setViewMode(val) {
    listMode = val;
    loadSpells(formatFilters(selectedFilters));
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