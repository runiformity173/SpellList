// "Closest match" spell when results are empty?
let SEARCH_QUERY = "";

function getNameForSpell(spell,concise=true) {
    const withoutSource = spell.name.replaceAll(" ","-").toLowerCase();
    if (concise && spell === getSpellByName(withoutSource)) {
        return withoutSource;
    }
    return withoutSource + "--" + spell.source;
}
const conciseMapping = {};
const spellLinkNames = {};
function loadSpells(filters) {
    document.getElementById("spellOptions").innerHTML = "";
    let selectedObjectArray = (selectedSpellList ? loadedSpellLists[selectedSpellList] : spells)
    for (const spell of selectedObjectArray) {
        if (!matchesFilter(spell, filters)) continue;
        const el = document.createElement("div");
        el.className = "list-group-item bg-dark text-light spell-item";
        let spellName = spellLinkNames[getNameForSpell(spell,concise=false)];
        if (!spellName) {
            spellName = getNameForSpell(spell);
            spellLinkNames[getNameForSpell(spell,concise=false)] = spellName;
        }
        el.id = spell.name + " " + spell.source;
        el.innerHTML = `
            <div class="row align-items-center g-2">
                <div class="col-5 fw-semibold">&emsp;&emsp;${spell.name}</div>
                <div class="col-2">${["Cantrip","1st","2nd","3rd","4th","5th","6th","7th","8th","9th"][spell.level]}</div>
                <div class="col-4">${schoolDict[spell.school]}</div>
                <div class="col-1">${spell.source}</div>
            </div>
        `;
        el.addEventListener("click",function () {
            window.location.replace("#"+spellName);
            document.querySelector("#spellOutput .spell-display").innerHTML = getSpellHTML(spell);
        });
        if (true) {
            const nel = document.createElement("div");
            nel.className = "position-absolute left-0 top-0";
            nel.style.width = "10%";
            nel.style.marginTop = "0.5em";
            nel.innerHTML = "a";
            el.appendChild(nel);
        }
        if (!matchesSearch(spell, SEARCH_QUERY)) {el.style.display = "none";}
        document.getElementById("spellOptions").appendChild(el);
    }
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
            matches = spell[filter.field].type == filter.value;
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
function filterSpells() {
    for (const spell of spells) {
        const el = document.getElementById((spell.name + " " + spell.source) || "");
        if (!el) continue;
        el.style.display = matchesSearch(spell, SEARCH_QUERY) ? "" : "none";
    }
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
function load() {
    loadAllKeys();
    loadSpells(formatFilters(selectedFilters));
    const spellName = decodeURIComponent(location.hash.slice(1));
    if (spellName) {
        const spell = getSpellByName(spellName);
        document.querySelector("#spellOutput .spell-display").innerHTML = getSpellHTML(spell);
        const target = document.getElementById(spell.name + " " + spell.source);
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
    }
    loadFilters();
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