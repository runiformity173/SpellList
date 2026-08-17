# Spell List
A replacement for my Spell Search site. It's ugly and not super functional. I want this next version to use all of the spell data and be much prettier.

## User Interface
Left-right split. The left side will be the place for search and filtering, and the right side will be the view.

### Search and Filter
There will be both a searchbar and a list of filters. Inspiration from 5e.tools, but summarize the filters (from 4 books)  

Include both simple and advanced filters. Simple is default OR and only that, complex can be AND and negative filters and such.  

Search just searches name, direct match.  

### Mobile
On mobile, top-bottom split with list and search on top and spell on the bottom.

### Display
The view will display like the spell displays in the book.  

Still have to decide if want to display classes and subclasses. If so, only display on main page.

## Paths/States
Use GET URL parameter for spell list. Hashes can choose first viewed spells, but try to pop them from history so that it only changes on reload.  

If on main page, dropdown for spell list select. If in spell lists, there's also one to go back to home.  

/view path views the spell in fullscreen, can pop a spell out into it AND can directly embed it from other applications. Other spell view locations import the methods from this path.

## Spell List Utils
- Preparation with limits and such
- Change details for always prepared