// "Closest match" spell when results are empty?

let SEARCH_QUERY = "";
function loadSpells(filters) {
    document.getElementById("spellOptions").innerHTML = "";
    for (const spell of spells) {
        if (!matchesFilter(spell, filters)) continue;
        const el = document.createElement("div");
        el.className = "list-group-item bg-dark text-light spell-item";
        el.id = spell.name + " " + spell.source;
        el.innerHTML = `
            <div class="row align-items-center g-2">
                <div class="col-5 fw-semibold">${spell.name}</div>
                <div class="col-2">${["Cantrip","1st","2nd","3rd","4th","5th","6th","7th","8th","9th"][spell.level]}</div>
                <div class="col-4">${schoolDict[spell.school]}</div>
                <div class="col-1">${spell.source}</div>
            </div>
        `;
        el.addEventListener("click",function () {
            window.location.replace("#"+spell.name.replaceAll(" ","-").toLowerCase());
            document.querySelector("#spellOutput .spell-display").innerHTML = getSpellHTML(spell);
        });
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
        const matches = spell[filter.field] == filter.value;
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
        const el = document.getElementById(spell.name + " " + spell.source);
        if (!el) continue;
        el.style.display = matchesSearch(spell, SEARCH_QUERY) ? "" : "none";
    }
}
function load() {
    loadSpells({
        mode: "ALL",
        filters: [
            {
                field: "source",
                value: "XPHB",
                mode: "IS",
            }
        ]
    });
    const spellName = decodeURIComponent(location.hash.slice(1)).replaceAll(" ","-");
    const spell = getSpellByName(spellName);
    document.querySelector("#spellOutput .spell-display").innerHTML = getSpellHTML(spell);
    loadFilters();
}



/* 
structure of a filter:
{
    mode: "ALL | ANY | MAX_ONE | NONE",
    filters: [

    ]
} | {
    field: "source",
    value: "",
    mode: "IS | NOT"
} | {
    mode: "NOT",
    filter: {}
}

*/