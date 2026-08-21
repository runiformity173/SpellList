import json
final = ""
with open("data/spell-index.json","r") as fl:
    index = json.load(fl)
spells = []
for key in index:
    with open("data/"+index[key],"r") as fl:
        spells.extend(json.load(fl)["spell"])
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