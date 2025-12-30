# Fresh Dashboard Plan - Particulier

## Doel
Nieuwe particulier gebruikers krijgen een **leeg dashboard** met onboarding i.p.v. demo data.

## Gedrag

### Nieuwe Gebruiker (eerste login)
- Leeg dashboard, geen properties
- Hero: Welkomstboodschap + "Eerste woning toevoegen" CTA
- Acties: Onboarding checklist (profiel invullen, foto toevoegen)
- "Bekijk demo" knop om demo data te laden

### Demo Account (`test@vimmo.nl`, `particulier@vimmo.nl`)
- Direct demo data met 3 voorbeeldpanden
- Statistieken, aanvragen, berichten gevuld

### Bestaande Gebruiker
- Eigen data uit database/localStorage
- Normale dashboard flow

## Technische Wijzigingen
1. `propertyContext.js`: Skip demo data voor nieuwe users
2. `dashboard-particulier.html`: Empty state UI
3. `auth.js`: `isNewUser` flag in login response
4. Database: `first_login_at` kolom

## UI Elementen Empty State
- Grote welkomst illustratie
- "Welkom bij VIMMO!" heading
- "Start met uw eerste advertentie" subtext
- Primary CTA: "Woning Toevoegen"
- Secondary: "Bekijk Demo"
