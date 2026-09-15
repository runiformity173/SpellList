import json
final = ""

with open("data/spell-index.json","r") as fl:
    index = json.load(fl)
spells = []
for key in index:
    with open("data/"+index[key],"r") as fl:
        spells.extend(json.load(fl)["spell"])

foundSources = {}

with open("data/spell-sources.json","r") as fl:
    spellClasses = json.load(fl)
for spell in spells:
    srcs = set()
    try:
        for cls in spellClasses[spell["source"]][spell["name"]]["classVariant"]:
            srcs.add(cls["name"])
    except:
        pass
    try:
        for cls in spellClasses[spell["source"]][spell["name"]]["class"]:
            srcs.add(cls["name"])
    except:
        pass
    spell["classes"] = list(srcs)
    src = spell["source"]
    if src in foundSources: foundSources[src] += 1
    else: foundSources[src] = 1
    

final += "const spells = " + json.dumps(spells) + ";\n"

sourceDict = {}
with open("data/books.json","r") as fl:
    books = json.load(fl)["book"]
for book in books:
    if book["source"] not in foundSources: continue
    sourceDict[book["source"]] = book["name"]
sourceDict["IDRotF"] = "Icewind Dale: Rime of the Frostmaiden"
sourceDict["LLK"] = "Lost Laboratory of Kwalish"
sourceDict["AitFR-AVT"] = "Adventures in the Forgotten Realms: A Verdant Tomb"

sourceDict = dict(sorted(sourceDict.items(),key=lambda x:(-foundSources[x[0]],x[0])))

final += "const sourceDict = " + json.dumps(sourceDict) + ";\n"

with open("data.js","w") as fl:
    fl.write(final)