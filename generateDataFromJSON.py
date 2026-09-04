import json
final = ""

with open("data/spell-index.json","r") as fl:
    index = json.load(fl)
spells = []
for key in index:
    with open("data/"+index[key],"r") as fl:
        spells.extend(json.load(fl)["spell"])

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
    

final += "const spells = " + json.dumps(spells) + ";\n"

sourceDict = {}
with open("data/books.json","r") as fl:
    books = json.load(fl)["book"]
for book in books:
    sourceDict[book["source"]] = book["name"]
sourceDict["IDRotF"] = "Icewind Dale: Rime of the Frostmaiden"
sourceDict["LLK"] = "Lost Laboratory of Kwalish"
sourceDict["AitFR-AVT"] = "Adventures in the Forgotten Realms: A Verdant Tomb"

final += "const sourceDict = " + json.dumps(sourceDict) + ";\n"

with open("data.js","w") as fl:
    fl.write(final)