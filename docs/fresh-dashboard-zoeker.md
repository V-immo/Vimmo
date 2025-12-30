# Fresh Dashboard Plan - Woningzoeker

## Doel
Nieuwe woningzoekers krijgen een **leeg dashboard** gericht op zoeken, niet op listings.

## Gedrag

### Nieuwe Gebruiker (eerste login)
- Geen opgeslagen woningen
- Geen zoekopdrachten
- Hero: "Vind uw droomwoning" met zoekbalk
- Suggesties voor populaire locaties

### Demo Account (`zoeker@vimmo.nl`)
- 2 opgeslagen favorieten
- 1 actieve zoekopdracht met alerts
- Geplande bezichting in agenda

### Bestaande Gebruiker
- Eigen opgeslagen woningen
- Eigen zoekopdrachten
- Eigen berichten

## Technische Wijzigingen
1. `propertyContext.js`: Skip `zoeker_favorites` demo data
2. `dashboard-zoeker.html`: Empty state voor favorieten
3. Zoekopdrachten pagina: "Maak eerste zoekopdracht" CTA

## UI Elementen Empty State
- Zoekbalk prominent
- "Nog geen opgeslagen woningen"
- "Start met zoeken" CTA
- Trending locaties carousel
