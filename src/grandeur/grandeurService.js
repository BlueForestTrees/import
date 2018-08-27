const grandeur = (key, label, units) => ({
    key,
    label,
    units
})

const unit = (shortname, name, coef) =>
    ({
        shortname: shortname,
        name: name,
        coef: coef
    })

export const loadGrandeurs = () => Promise.resolve(
    [
        grandeur("PNOF", "PNOF - Potentially Not Occuring Number of plant species in terrestrial ecosystems * time", [
            unit("PNOF", "Potentially Not Occuring Number of plant species in terrestrial ecosystems * time (PNOF)", 1)
        ]),
        grandeur("PDF", "PDF - Potentially Disappeared Number of plant species in terrestrial ecosystems * time", [
            unit("PDF", "Potentially Disappeared Number of plant species in terrestrial ecosystems * time (PDF)", 1)
        ]),
        grandeur("DALY", "DALY - Disability Adjusted Life Years - Calculations adapted to USEtox midpoint (Huijbregts et al., 2005).", [
            unit("DALY", "Disability Adjusted Life Years (DALY)", 1)
        ]),
        grandeur("CTUh", "CTUh - Comparative Toxic Unit for humans", [
            unit("CTUh", "Comparative Toxic Unit for humans (CTUh) * volume * time", 1)
        ]),
        grandeur("CTUe", "CTUe - Comparative Toxic Unit for ecosystems", [
            unit("CTUe", "Comparative Toxic Unit for ecosystems (CTUe) * volume * time", 1)
        ]),
        grandeur("Ene1", "Energie (J, kJ, MJ...)", [
            unit("MJ", "Méga-Joule (MJ)", 1),
            unit("kJ", "Kilo-Joule (kJ)", 0.001),
            unit("J", "Joule (J)", 0.000001),
        ]),
        grandeur("Ene2", "Energie (Wh, kWh...)", [
            unit("Ws", "Watt-Seconde (Ws)", 0.001 / 3600),
            unit("Wm", "Watt-Minute (Wm)", 0.001 / 60),
            unit("Wh", "Watt-Heure (Wh)", 0.001),
            unit("kWh", "KiloWatt-Heure (kWh)", 1)
        ]),
        grandeur("Dens", "Densité (mol, mmol...)", [
            unit("μmol", "Micro-mole (umol)", 0.000001),
            unit("mmol", "Milli-mole (mmol)", 0.001),
            unit("mol", "Mole (mol)", 1),
            unit("kmol", "Kilo-Mole (mol)", 1000)
        ]),
        grandeur("Nomb", "Nombre (pas d'unité)", [
            unit("Nomb", "pas d'unité", 1),
            unit("Item(s)", "items", 1)
        ]),
        grandeur("Volu", "Volume (L, m3...)", [
            unit("goutte", "Goutte", 0.001 * 20000),
            unit("L", "Litre (L)", 0.001),
            unit("dL", "Déci-litre (dL)", 0.001 * 0.1),
            unit("cL", "Centi-litre (cL)", 0.001 * 0.01),
            unit("mL", "Milli-litre (mL)", 0.001 * 0.001),
            unit("m3", "Mètre-cube (m3)", 1),
        ]),
        grandeur("Duré", "Durée (sec, min, h...)", [
            unit("sec", "Seconde (sec)", 1),
            unit("min", "Minute (min)", 60),
            unit("h", "Heure (h)", 60 * 60),
            unit("j", "Jour (j)", 60 * 60 * 24),
            unit("mois", "Mois (mois)", 60 * 60 * 24 * 30 * 355),
            unit("an", "Année (an)", 60 * 60 * 24 * 30 * 355 * 12)
        ]),
        grandeur("Mass", "Masse (g, kg...)", [
            unit("mg", "Milligramme (mg)", 0.000001),
            unit("g", "Gramme (g)", 0.001),
            unit("kg", "Kilo-gramme (kg)", 1),
            unit("t", "Tonne (t)", 1000),
            unit("Mt", "Mega-tonne (Mt)", 1000000)
        ]),
        grandeur("Surf", "Surface (m2, hec...)", [
            unit("m2", "Mètre-carré (m2)", 1),
            unit("cm2", "Centimètre-carré (m2)", 0.0001),
            unit("hec", "Hectare (hec)", 10000)
        ]),
        grandeur("Long", "Longueur (mm, m, km...)", [
            unit("mm", "Millimètre (mm)", 0.001),
            unit("cm", "Centimètre (cm)", 0.01),
            unit("m", "Mètre (m)", 1),
            unit("km", "Kilo-mètre (km)", 1000)
        ]),
        grandeur("Pri1", "Prix/Coût (€...)", [
            unit("M€", "milliard-euro (€)", 1000000000),
            unit("m€", "million-euro (€)", 1000000),
            unit("k€", "kilo-euro (€)", 1000),
            unit("€", "euro (€)", 1),
        ]),
        grandeur("Pri2", "Prix/Coût (€...)", [
            unit("M$", "billion-dollar ($)", 1000000),
            unit("m$", "million-dollar ($)", 1000000),
            unit("k$", "kilo-dollar ($)", 1000),
            unit("$", "dollar ($)", 1),
        ]),
        grandeur("Tran", "Transport (t*km...)", [
            unit("t*km", "Tonne Kilomètre (t*km)", 1),
            unit("kg*km", "Kilogramme Kilomètre (kg*km)", 0.001)
        ])
    ])