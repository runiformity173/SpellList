/*
<span class="badge rounded-pill text-bg-primary">Damage: Fire</span>
<span class="badge rounded-pill text-bg-light border text-dark">Concentration: No</span>
*/

// attacks, range?, area?

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
    {
        name: "Class",
        options: {
            "Artificer":"Artificer",
            "Bard":"Bard",
            "Cleric":"Cleric",
            "Druid":"Druid",
            "Paladin":"Paladin",
            "Ranger":"Ranger",
            "Sorcerer":"Sorcerer",
            "Warlock":"Warlock",
            "Wizard":"Wizard",
        }
    },
    {
        name: "Casting Time",
        options: {
            "action":"Action",
            "bonus":"Bonus Action",
            "reaction":"Reaction",
            "minute":"Minutes",
            "hour":"Hours",
        }
    },
    {
        name: "Duration",
        options: {
            "instant":"Instantaneous",
            "round":"Round",
            "minute":"Minutes",
            "hour":"Hours",
            "day":"Days",
            "permanent":"Permanent",
            "special":"Special",
        }
    },
    {
        name: "Misc",
        options: {
            "C": "Concentration",
            "R": "Ritual",
            "V": "Verbal",
            "S": "Somatic",
            "M": "Material",
            "MC": "Material with Cost",
            "CM": "Consumed Material",
        }
    },
    {
        name: "Effects",
        options: {
            "AAD": "Additional Attack Damage",
            "OBJ": "Affects Objects",
            "LGT": "Creates Light",
            "LGTS": "Creates Sunlight",
            "DFT": "Difficult Terrain",
            "FMV": "Forced Movement",
            "ADV": "Grants Advantage",
            "THP": "Grants Temporary Hit Points",
            "HL": "Healing",
            "MAC": "Modifies AC",
            "OBS": "Obscures Vision",
            "PRM": "Permanent Effects",
            "PIR": "Permanent If Repeated",
            "PS": "Plane Shifting",
            "SGT": "Requires Sight",
            "RO": "Rollable Effects",
            "SCL": "Scaling Effects",
            "SCT": "Scaling Targets",
            "SMN": "Summons Creature",
            "TP": "Teleportation",
            "UBA": "Uses Bonus Action",
        }
    },
    {
        name: "Damage",
        options: {
            "acid": "Acid",
            "bludgeoning": "Bludgeoning",
            "cold": "Cold",
            "fire": "Fire",
            "force": "Force",
            "lightning": "Lightning",
            "necrotic": "Necrotic",
            "piercing": "Piercing",
            "poison": "Poison",
            "psychic": "Psychic",
            "radiant": "Radiant",
            "slashing": "Slashing",
            "thunder": "Thunder",
        }
    },
    {
        name: "Condition",
        options: {
            "blinded": "Blinded",
            "charmed": "Charmed",
            "deafened": "Deafened",
            "frightened": "Frightened",
            "grappled": "Grappled",
            "incapacitated": "Incapacitated",
            "invisible": "Invisible",
            "paralyzed": "Paralyzed",
            "petrified": "Petrified",
            "poisoned": "Poisoned",
            "prone": "Prone",
            "restrained": "Restrained",
            "stunned": "Stunned",
            "unconscious": "Unconscious",
        }
    },
    {
        name: "Saves",
        options: {
            "strength": "Strength",
            "dexterity": "Dexterity",
            "constitution": "Constitution",
            "intelligence": "Intelligence",
            "wisdom": "Wisdom",
            "charisma": "Charisma",
        }
    },
];
const fieldMap = {
    "Source":"source",
    "Level":"level",
    "School":"school",
    "Class":"classes",
    "Casting Time":"time",
    "Duration":"duration",
    "Misc":"special",
    "Effects":"miscTags",
    "Damage":"damageInflict",
    "Condition":"conditionInflict",
    "Saves":"savingThrow"
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
                });
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
        const pill = document.createElement("span");
        pill.classList = "badge rounded-pill text-bg-primary filter-pill cursor-pointer";
        let label = filter.name + ": ";
        if (selected.length == 0) {
            pill.classList.remove("text-bg-primary");
            pill.classList.add("text-bg-secondary");
            label += "Any";
        } else if (selected.length == 1) {
            if (selected[0][0] == "!") label += "!"+filter.options[selected[0].slice(1)];
            else label += filter.options[selected[0]];
        } else {
            label += "...";
        }
        pill.innerHTML = label;
        pill.addEventListener("click", function() { // construct and display filters modal
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
                    saveKey("selectedFilters");
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