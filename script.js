// "Closest match" spell when results are empty?
let SEARCH_QUERY = "";
let sortingReversed = false;
let sortingMode = "level";

function compareSpells(a,b) {
    if (sortingMode == "level") {
        if (a.level != b.level) return a.level-b.level;
    } else if (sortingMode == "name") {
        if (a.name != b.name) return a.name.localeCompare(b.name);
    } else if (sortingMode == "school") {
        if (a.school != b.school) return schoolDict[a.school].localeCompare(schoolDict[b.school]);
    } else if (sortingMode == "source") {
        if (a.source != b.source) return a.source.localeCompare(b.source);
    }
    if (a.level != b.level) return a.level-b.level;
    if (a.name != b.name) return a.name.localeCompare(b.name);
    if (a.source != b.source) return a.source.localeCompare(b.source);
    return 0;
}
function reversableCompareSpells(a,b) {
    return (sortingReversed ? -1 : 1) * compareSpells(a,b);
}
function moveSortingArrow() {
    const headers = document.getElementById("spellListHeaders").firstElementChild;
    for (const el of headers.children) {
        el.innerHTML = el.innerHTML.replaceAll(/[↑↓]/g,"");
    }
    let arrow = sortingReversed ? "↑" : "↓";
    if (sortingMode == "name") headers.children[0].innerHTML += arrow;
    if (sortingMode == "level") headers.children[1].innerHTML += arrow;
    if (sortingMode == "school") headers.children[2].innerHTML += arrow;
    if (sortingMode == "source") headers.children[3].innerHTML += arrow;
}
function clickSortMode(mode) {
    if (mode == sortingMode) sortingReversed = !sortingReversed;
    else {
        sortingReversed = false;
        sortingMode = mode;
    }
    moveSortingArrow();
    loadSpells(formatFilters(selectedFilters));
    saveKey("sortData");
}
function getNameForSpell(spell,concise=true) {
    const withoutSource = spell.name.replaceAll(" ","-").toLowerCase();
    if (concise && spell === getSpellByName(withoutSource)) {
        return withoutSource;
    }
    return withoutSource + "--" + spell.source;
}
const spellLinkNames = {};
function loadSpells(filters) {
    document.getElementById("spellOptions").innerHTML = "";
    let selectedObjectArray;
    if (selectedSpellList && listMode == "View List") selectedObjectArray = Array.from(loadedSpellLists[selectedSpellList]);
    else if (selectedSpellList && listMode == "Edit Always Prepared") {
        const preparedSet = new Set(spellLists[selectedSpellList].prepared);
        selectedObjectArray = Array.from(loadedSpellLists[selectedSpellList].filter(spell => preparedSet.has(getNameForSpell(spell,concise=false))));
    } else selectedObjectArray = Array.from(spells);
    let spellSet; // spells that start checked
    if (selectedSpellList && listMode == "Edit List") {
        spellSet = new Set(spellLists[selectedSpellList].spells);
    } else if (selectedSpellList && listMode == "Edit Always Prepared") {
        spellSet = new Set(spellLists[selectedSpellList].alwaysPrepared);
    } else if (selectedSpellList) {
        spellSet = new Set(spellLists[selectedSpellList].prepared);
    }
    selectedObjectArray.sort(reversableCompareSpells);
    for (const spell of selectedObjectArray) {
        if (!matchesFilter(spell, filters)) continue;
        const el = document.createElement("div");
        el.tabIndex = 0;
        el.className = "list-group-item bg-dark text-light spell-item";
        el.id = spell.name + " " + spell.source;
        el.innerHTML = `
            <div class="row align-items-center g-2">
                <div class="col-5 fw-semibold">${spell.name}</div>
                <div class="col-2">${["Cantrip","1st","2nd","3rd","4th","5th","6th","7th","8th","9th"][spell.level]}</div>
                <div class="col-3">${schoolDict[spell.school]}</div>
                <div class="col-1">${spell.source}</div>
            </div>
        `;
        el.addEventListener("click",function () {
            window.location.replace("#"+getNameForSpell(spell));
            document.querySelector("#spellOutput .spell-display").innerHTML = getSpellHTML(spell);
            document.querySelector(".selected-spell-item")?.classList?.remove?.("selected-spell-item");
            el.classList.add("selected-spell-item");
            el.focus({ focusVisible: false });
        });
        if (selectedSpellList) {
            const spellName = getNameForSpell(spell,concise=false);
            const nel = document.createElement("div");
            nel.className = "position-absolute top-0";
            nel.style.width = "10%";
            nel.style.marginTop = "0.5em";
            const disabled = listMode == "View List" && spellLists[selectedSpellList].alwaysPrepared.includes(spellName);
            nel.innerHTML = `<input tabindex="-1" type="checkbox" class="cursor-pointer spell-checkbox" onclick="setSpellInList('${spellName}',this.checked)" id="checkbox-${spellName}"${disabled ? " disabled" : ""}>`;
            nel.firstElementChild.checked = spellSet.has(spellName);
            el.appendChild(nel);
            el.addEventListener("keypress",function (e) {
                if (e.key == "Enter") {
                    nel.firstElementChild.click();
                }
            });
        }
        if (!matchesSearch(spell, SEARCH_QUERY)) {el.style.display = "none";}
        document.getElementById("spellOptions").appendChild(el);
    }
    reevaluateSelectAllChecked();
    updatePreparedFraction();
    document.getElementById("selectAllCheckbox").style.display = selectedSpellList ? "" : "none";
}
function matchesFilter(spell, filter) {
    if (!filter) return true;
    if (filter.mode == "NOT" && filter.filter) {
        return !matchesFilter(spell, filter.filter);
    }
    if (["IS","NOT"].includes(filter.mode)) {
        let matches;
        if (filter.field == "time") {
            matches = spell[filter.field].map(o=>o.unit).includes(filter.value);
        } else if (filter.field == "range") {
            matches = spell[filter.field].type == filter.value || spell[filter.field].distance?.type == filter.value;
            if (filter.value == "area") matches = !["special","point"].includes(spell[filter.field].type);
            else if (["self","touch"].includes(spell[filter.field].distance?.type)) matches = spell[filter.field].distance?.type == filter.value;
            else if (filter.value == "point") matches = spell[filter.field].type == "point";
        } else if (filter.field == "duration") {
            matches = spell[filter.field].map(o=>(o.type == "timed" ? o.duration.type : o.type)).includes(filter.value);
        } else if (filter.field == "special") {
            if (filter.value == "C") matches = spell.duration.map(o=>o.concentration).some(o=>o);
            if (filter.value == "R") matches = !!spell.meta?.ritual;
            if (filter.value == "V") matches = !!spell.components?.v;
            if (filter.value == "S") matches = !!spell.components?.s;
            if (filter.value == "M") matches = !!spell.components?.m;
            if (filter.value == "MC") matches = !!spell.components?.m?.cost;
            if (filter.value == "CM") matches = !!spell.components?.m?.consume;
        } else {
            matches = spell[filter.field] == filter.value || 
            Array.isArray(spell[filter.field]) && spell[filter.field].includes(filter.value);
        }
        const expected = filter.mode == "IS";
        return matches == expected;
    }
    const reversed = ["MAX_ONE","NONE"].includes(filter.mode);
    const mode = {"ALL":"AND","ANY":"OR","MAX_ONE":"AND","NONE":"OR"}[filter.mode];
    for (const f of filter.filters) {
        const res = matchesFilter(spell, f);
        if (res && mode == "OR") return !reversed;
        if (!res && mode == "AND") return reversed;
    }
    if (mode == "OR") return reversed;
    else if (mode == "AND") return !reversed;
}
function matchesSearch(spell, search) {
    const processedSearch = search.toLowerCase();
    if (spell.name.toLowerCase().includes(processedSearch)) return true;
    return false;
}
function filterSpells(returnVal=false) {
    let result = []; // used for matching spells if returnVal else all loaded spells matching filters
    let foundAny;
    for (const spell of spells) {
        const el = document.getElementById((spell.name + " " + spell.source) || "");
        if (!el) continue;
        if (returnVal) {
            if (matchesSearch(spell, SEARCH_QUERY)) {
                result.push(spell);
            }
        } else {
            result.push(spell);
            const matches = matchesSearch(spell, SEARCH_QUERY);
            el.style.display = matches ? "" : "none";
            if (matches) foundAny = true;
        }
    }
    if (!returnVal) {
        document.getElementById("didYouMean").style.display = "none";
        reevaluateSelectAllChecked();
        if (!foundAny) {
            const closestSpell = getSpellByName(SEARCH_QUERY,list=result);
            const el = document.getElementById(closestSpell.name + " " + closestSpell.source);
            if (el) {
                document.getElementById("didYouMean").style.display = "";
                el.style.display = "";
            }
        }
    }
    return result;
}
function load() {
    loadAllKeys();
    loadSpells(formatFilters(selectedFilters));
    const spellName = decodeURIComponent(location.hash?.slice?.(1));
    const spell = getSpellByName(spellName);
    let target = document.getElementById(spell.name + " " + spell.source);
    if (!target || spellName == "undefined") target = document.getElementById("spellOptions").firstElementChild;
    target.click();
    if (target) {
        let scrollTarget = target;
        for (let i = 0; i < 2 && scrollTarget.previousElementSibling; i++) {
            scrollTarget = scrollTarget.previousElementSibling;
        }
        scrollTarget.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        target.classList.add("emphasize-flash-animation");
    }
    loadFilters();
    updatePreparedFraction();
}



/* 
structure of a filter:
type Filter = {
    mode: "ALL" | "ANY" | "MAX_ONE" | "NONE";
    filters: Filter[];
} | {
    field: string;
    value: string;
    mode: "IS" | "NOT";
} | {
    mode: "NOT";
    filter: Filter;
};

*/