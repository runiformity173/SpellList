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
    } else if (listMode == "Edit Always Prepared") {
        if (confirm(`Are you sure you want to set all of these spells to ${val ? "always prepared" : "not always prepared"}?`)) {
            for (const spell of filterSpells(returnVal=true)) {
                const spellName = getNameForSpell(spell,concise=false);
                setSpellInList(spellName,val,save=false);
                document.getElementById("checkbox-"+spellName).checked = val;
            }
            saveKey("spellLists");
        }
    } else {
        if (confirm(`Are you sure you want to ${val ? "prepare" : "unprepare"} all of these spells?`)) {
            const alwaysPrepared = selectedSpellList ? new Set(spellLists[selectedSpellList].alwaysPrepared) : new Set();
            for (const spell of filterSpells(returnVal=true)) {
                const spellName = getNameForSpell(spell,concise=false);
                if (!val && alwaysPrepared.has(spellName)) continue;
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
function updatePreparedFraction() {
    if (!selectedSpellList) return;
    const spellList = spellLists[selectedSpellList];
    if (listMode == "Edit List") {
        document.getElementById("spellPreparedSpan").innerHTML = `<input
            id="spellPreparedInput"
            value="${spellList.maxPrepared}"
            onchange="spellLists[selectedSpellList].maxPrepared = Number(this.value);saveKey('spellLists');"
        >`
        return;
    }
    if (spellList.maxPrepared <= 0) {
        document.getElementById("spellPreparedSpan").innerHTML = "";
        return;
    }
    document.getElementById("spellPreparedSpan").innerHTML = (spellList.prepared.length - 
        spellList.alwaysPrepared.length) + 
        "/" + spellList.maxPrepared;
}
function setSpellInList(spellName,toggle,save=true) {
    const spellList = spellLists[selectedSpellList];
    if (listMode == "View List") {
        const targetList = spellList.prepared;
        if (toggle) {
            if (targetList.includes(spellName)) return; // already prepared
            targetList.push(spellName);
        } else {
            const removedIndex = targetList.indexOf(spellName);
            if (removedIndex == -1) return; // not prepared, so don't remove it
            targetList.splice(removedIndex,1);
        }
    } else if (listMode == "Edit List") {
        if (toggle) {
            if (spellList.spells.includes(spellName)) return; // already in list
            spellList.spells.push(spellName);
            loadedSpellLists[selectedSpellList].push(getSpellByName(spellName));
        } else {
            const removedIndex = spellList.spells.indexOf(spellName);
            if (removedIndex == -1) return; // not in list, so don't remove it
            loadedSpellLists[selectedSpellList].splice(removedIndex,1);
            spellList.spells.splice(removedIndex,1);
            for (const key of ["prepared","alwaysPrepared"]) {
                const index = spellList[key].indexOf(spellName);
                if (index != -1) spellList[key].splice(index,1);
            }
        }
    } else if (listMode == "Edit Always Prepared") {
        if (toggle) {
            if (spellList.alwaysPrepared.includes(spellName)) return;
            if (!spellList.prepared.includes(spellName)) return;
            spellList.alwaysPrepared.push(spellName);
        } else {
            const removedIndex = spellList.alwaysPrepared.indexOf(spellName);
            if (removedIndex == -1) return; // not always prepared, don't remove it
            spellList.alwaysPrepared.splice(removedIndex,1);
        }
    }
    updatePreparedFraction();
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
            alwaysPrepared: [],
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