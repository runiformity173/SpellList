// turn spells to dict to search quicker?

// TODO: table styling
const schoolDict = {
    "A": "Abjuration",
    "C": "Conjuration",
    "D": "Divination",
    "V": "Evocation",
    "E": "Enchantment",
    "I": "Illusion",
    "N": "Necromancy",
    "T": "Transmutation",
}
function getSpellByName(name) {
  const spellName = name.split("--")[0].toLowerCase().replaceAll("-"," ");
  const spellSource = (name.split("--")[1] || "XPHB").toLowerCase();
  for (const spell of spells) {
    if (spell.name.toLowerCase() == spellName && spellSource == spell.source.toLowerCase()) {
      return spell;
    }
  }
  console.log("no spell found with name",name)
  console.log("parsed name \"" + spellName + "\" and source \"" + spellSource + "\"")
}
function spellToHash(spell) {
    return spell.name.toLowerCase().replaceAll(" ","-") + "--" + spell.source;
}
function parseStrings(str) {
  if (!str) return "";
  if (typeof str === 'string' || str instanceof String) {
    const regex = /\{@[^\s]+\s+([^|}]+)\s*\|?[^}]*\}/g;
    return str.replace(regex, function(match, item){
      let final = item.trim();
      if (match.includes("@creature")) {
        final = `<a class='rollLink' href='https://runiformity173.github.io/dnd/MonsterSearch/display/#${final.replaceAll(' ','-')}' target='_blank'>${final}</a>`
      } else if (match.includes("@spell")) {
        final = `<a class='rollLink' href='https://runiformity173.github.io/SpellList/view/#${final.replaceAll(' ','-')}' target='_blank'>${final}</a>`
      } else if (match.includes("@i ")) {
        final = `<i>${final}</i>`;
      } else {
        const splat = match.split("|");
        if (splat.length == 3) {
          final = splat[splat.length-1].replace(/[{}]/g,"").trim();
        }
      }
      return final;
    });
  } else if (typeof str === 'object' && !Array.isArray(str) && str !== null) {
    return str?.roll?.exact || parseStrings(str?.entry) || "";
  }
  return str;
}
function isDice(str) {
  return /^\d*d\d+(\s?\+\s?\d*d\d+)*$/.test(str);
}
function loadTable(table) {
    const el = document.createElement("table");
    el.innerHTML = `
    <tr>
        <th class="tableName" colspan="6"></th>
        <tr>
            <td colspan="6">
                <table>
                <thead>
                    <tr class="tableLabels">
                    
                    </tr>
                </thead>
                <tbody class="tableBody">
                </tbody>
                </table>
            </td>
        </tr>
    </tr>`;
    if (table.caption) {
        el.querySelector(`.tableName`).innerHTML = table.caption;
    } else {
        el.querySelector(".tableName").remove();
    }
    let finalHeaders = "";
    let rollable = false;
    for (let i = 0;i<(table.colLabels||[]).length;i++) {
        if (i == 0 && isDice(table.colLabels[i])) rollable = true; 
        finalHeaders += `<th class="${table.colStyles[i]}">${table.colLabels[i]}</th>`;
    }
    el.querySelector(`.tableLabels`).innerHTML = finalHeaders;
    let finalBody = "";
    for (let j = 0;j < table.rows.length;j++) {
        let style = "";
        if (table.rows[j].style) {
            if (table.rows[j].type != "row") {
                alert(`not a row, wdym: ${name}[${j}]`);
                return;
            } if (table.rows[j].style != "row-indent-first") {
                alert(`not a row-indent-first: ${name}[${j}]`);
                return;
            }
            style = table.rows[j].style;
        }
        finalBody += "<tr>";
        let colCounter = 0;
        for (let i = 0;i<table.colStyles.length;i++) {
            switch (style) {
                case "":
                const text = table.rows[j][i];
                if (!text) break;
                if (text?.width) {
                    finalBody += `<td colspan="${table.colStyles.length}">${parseStrings(text)}</td>`;
                    break;
                }
                finalBody += `<td class="${table.colStyles[i]}">${parseStrings(text)}</td>`;
                break;
                case "row-indent-first":
                finalBody += `<td class="${table.colStyles[i]}">${i==0?INDENT:""}${parseStrings(table.rows[j].row[i])}</td>`;
                break;
                default:
                alert("defaulting on row style, very bad");
                break;
            }
        }
        finalBody += "</tr>";
    }
    el.querySelector(`.tableBody`).innerHTML = finalBody;
    return el.outerHTML;
}
function listFormat(elements, connector="and") {
    if (elements.length == 0) return;
    if (elements.length == 1) return elements[0];
    if (elements.length == 2) return elements[0] + " " + connector + " " + elements[1];
    return elements.slice(0,-1).join(", ") + ", " + connector + " " + elements[elements.length-1];
}
function capitalize(string) {
    return string.split(" ").map(o=>o[0].toUpperCase() + o.slice(1)).join(" ")
}
function parseTime(times, ritual=false) {
    const results = [];
    for (const time of times) {
        let result = "";
        if (["action","reaction","bonus"].includes(time.unit) && !time.condition) {
            result = capitalize(time.unit == "bonus" ? "bonus action" : time.unit);
        } else if (time.condition) {
            return {reaction:"Reaction",bonus:"Bonus Action"}[time.unit] + ", " + time.condition;
        } else {
            result = time.number + " " + time.unit + (time.number > 1 ? "s" : "");
        }
        if (time.note) {
            result += ` (${time.note})`;
        }
        results.push(result);
    }
    if (ritual) results.push("Ritual");
    return listFormat(results, "or");
}
function parseComponents(components) {
    const results = [];
    if (components.v) results.push("V");
    if (components.s) results.push("S");
    if (components.m) results.push(`M (${components.m.text || components.m})`);
    return results.join(", ")
}
function parseRange(range) {
    if (range.type == "point") {
        if (range.distance.type == "self") return "Self";
        if (range.distance.type == "touch") return "Touch";
        if (range.distance.type == "sight") return "Sight";
        if (range.distance.type == "unlimited") return "Unlimited";
        if (range.distance.amount == 1) return "1 " + {miles: "mile", feet: "foot"}[range.distance.type];
        return range.distance.amount + " " + range.distance.type;
    } else {
        return "Self";
    }
}
function parseDuration(durations) {
    const results = [];
    for (const duration of durations) {
        if (duration.type == "instant") results.push("Instantaneous");
        else if (duration.type == "special") results.push("Special");
        else if (duration.type == "timed") {
            let result = duration.concentration ? "Concentration, up to " : "";
            const amt = duration.duration.amount
            result += amt + " " + duration.duration.type;
            result += amt > 1 ? "s" : "";
            results.push(result);
        }
        else if (duration.type == "permanent") {
            results.push("Until dispelled" + (duration.ends.includes("trigger") ? " or triggered" : ""));
        }
    }
    return listFormat(results, "or");
}
function parseEntry(entry) {
    if (typeof entry === "string") {
        return `${parseStrings(entry)}`;
    }
    let final = "";
    if (entry?.name) {
        final += `<strong><em>${entry.name}.</em></strong> `;
    }
    if (entry?.type == "entries") {
        for (const subEntry of entry.entries) {
            final += parseEntry(subEntry);
        }
    }
    if (entry?.type == "list") {
        final += "<ul>"
        for (const item of entry.items) {
            final += `<li>${parseEntry(item)}</li>`;
        }
        final += "</ul>"
    }
    if (entry?.type == "table") {
        return loadTable(entry);
    }
    return final;
}
function getSpellHTML(spell) {
    let body = "";
    for (const entry of spell.entries.concat(spell.entriesHigherLevel || [])) {
        const parsedEntry = parseEntry(entry);
        body += entry?.type == "table" ? parsedEntry : `<p>${parsedEntry}</p>`;
    }
    const school = schoolDict[spell.school];
    const levelAndSchool = spell.level == 0 ? school + " Cantrip" : `Level ${spell.level} ${school}`;
    return `
    <div class="spell-source" title="${sourceDict[spell.source]}"><h3>${spell.source}</h3></div>
    <h3>${spell.name}</h3>
    <p><em>${levelAndSchool}</em></p>
    <dl>
        <dt><strong>Casting Time:</strong></dt>
        <dd>${parseTime(spell.time,spell.meta?.ritual)}</dd><br>
        <dt><strong>Range:</strong></dt>
        <dd>${parseRange(spell.range)}</dd><br>
        <dt><strong>Components:</strong></dt>
        <dd>${parseComponents(spell.components)}</dd><br>
        <dt><strong>Duration:</strong></dt>
        <dd>${parseDuration(spell.duration)}</dd><br>
    </dl>
    ${body}
    `;
}
function loadSpellHTML() {
    const spellName = decodeURIComponent(location.hash.slice(1)).replaceAll(" ","-");
    const spell = getSpellByName(spellName);
    console.log(spell);
    document.querySelector("#main .spell-display").innerHTML = getSpellHTML(spell);
}
loadSpellHTML();
window.addEventListener("hashchange",loadSpellHTML)

for (const spell of spells) {
    try {
        const res = getSpellHTML(spell);
        if (res.includes("undefined")) console.log(spell.name, spellToHash(spell));
    } catch (e) {
        console.log(spell.name);
        console.log(e);
    }
}