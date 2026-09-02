/*
<span class="badge rounded-pill text-bg-primary">Damage: Fire</span>
<span class="badge rounded-pill text-bg-light border text-dark">Concentration: No</span>
*/

// save and load filters from localstorage
const filterOptions = [
    {
        name: "Source",
        options: {
            "XPHB": "XPHB",
            "TCE": "TCE",
            "XGE": "XGE",
        }
    },
    {
        name: "Level",
        options: {
            0:"Cantrip",
            1:"1st",
            2:"2nd",
            3:"3rd",
            4:"4th",
            5:"5th",
            6:"6th",
            7:"7th",
            8:"8th",
            9:"9th",
        }
    },
    {
        name: "School",
        options: {
            "A":"Abjuration",
            "C":"Conjuration",
            "D":"Divination",
            "E":"Enchantment",
            "V":"Evocation",
            "I":"Illusion",
            "N":"Necromancy",
            "T":"Transmutation",
        }
    },
];
const fieldMap = {
    "Source":"source",
    "Level":"level",
    "School":"school",
};
const selectedFilters = {};
for (const i of filterOptions) selectedFilters[i.name] = [];

function formatFilters(filters) {
    const final = {};
    final.mode = "ALL";
    final.filters = [];
    for (const field in filters) {
        const yesses = [];
        for (const i of filters[field]) {
            if (i[0] == "!") {
                final.filters.push({
                    mode: "NOT",
                    field: fieldMap[field],
                    value: i.slice(1),
                })
            } else {
                yesses.push({
                    mode: "IS",
                    field: fieldMap[field],
                    value: i,
                });
            }
        }
        if (yesses.length) {
            final.filters.push({
                mode: "ANY",
                filters: yesses,
            })
        }
    }
    return final;
}

function loadFilters() {
    const filterModal = document.getElementById("filterModal");
    const bsFilterModal = new bootstrap.Modal(filterModal);
    const modalBody = filterModal.querySelector(".modal-body");
    document.getElementById("spellFiltersContainer").innerHTML = "";
    for (const filter of filterOptions) {
        const selected = selectedFilters[filter.name];
        let label = filter.name + ": ";
        if (selected.length == 0) {
            if (filter.name != "Other") {
                label += "Any";
            }
        } else if (selected.length == 1) {
            if (selected[0][0] == "!") label += "!"+filter.options[selected[0].slice(1)];
            else label += filter.options[selected[0]];
        } else {
            label += "...";
        }
        const pill = document.createElement("span");
        pill.classList = "badge rounded-pill text-bg-primary filter-pill cursor-pointer";
        pill.innerHTML = label;
        pill.addEventListener("click", function() { // construct and display filter's modal
            filterModal.querySelector(".modal-title").innerHTML = filter.name + " Filters";
            modalBody.innerHTML = "";
            for (const i in filter.options) {
                let state = selected.includes(i) ? "yes" : selected.includes("!" + i) ? "no" : "maybe";
                const innerPill = document.createElement("span");
                innerPill.className = `badge rounded-pill ${{yes: "text-bg-primary", no: "text-bg-danger", maybe: "text-bg-secondary"}[state]} cursor-pointer`
                innerPill.innerHTML = filter.options[i];
                innerPill.addEventListener("click",function() { // clicking on modal's filter pill to toggle it
                    if (state == "maybe") {
                        state = "yes";
                        innerPill.classList.remove("text-bg-secondary");
                        innerPill.classList.add("text-bg-primary");
                        selectedFilters[filter.name].push(i);
                    } else if (state == "yes") {
                        state = "no";
                        innerPill.classList.remove("text-bg-primary");
                        innerPill.classList.add("text-bg-danger");
                        selectedFilters[filter.name].splice(selectedFilters[filter.name].indexOf(i),1);
                        selectedFilters[filter.name].push("!" + i);
                    } else {
                        state = "maybe";
                        innerPill.classList.remove("text-bg-danger");
                        innerPill.classList.add("text-bg-secondary");
                        selectedFilters[filter.name].splice(selectedFilters[filter.name].indexOf("!" + i),1);
                    }
                    // TODO: save current filters to localstorage here
                    loadSpells(formatFilters(selectedFilters));
                    filterSpells();
                    loadFilters();
                });
                modalBody.appendChild(innerPill);
            }
            bsFilterModal.show();
        })
        document.getElementById("spellFiltersContainer").appendChild(pill);
    }
}