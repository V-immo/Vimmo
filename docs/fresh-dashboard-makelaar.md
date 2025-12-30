# Fresh Dashboard Plan - Makelaar

## Doel
Nieuwe makelaars krijgen een **leeg kantoor dashboard** met setup wizard.

## Gedrag

### Nieuwe Gebruiker (eerste login)
- Geen panden in portfolio
- Geen teamleden
- Setup wizard: kantoorgegevens, logo, BIV-nummer
- "Eerste pand toevoegen" na setup

### Demo Account (`makelaar@vimmo.nl`)
- 5 actieve panden
- 2 teamleden
- Statistieken en leads
- Berichten van potentiële kopers

### Bestaande Gebruiker
- Eigen portfolio
- Eigen team
- Kantoor statistieken

## Technische Wijzigingen
1. `propertyContext.js`: Skip makelaar demo data
2. `dashboard-makelaars.html`: Setup wizard flow
3. Kantoor settings eerst invullen

## UI Elementen Empty State
- "Welkom bij VIMMO Pro"
- 3-staps setup wizard
- Step 1: Kantoorgegevens
- Step 2: BIV verificatie
- Step 3: Eerste pand
