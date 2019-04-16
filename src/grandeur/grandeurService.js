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
        grandeur("NO", "NO - Potentially Not Occuring Number of plant species in terrestrial ecosystems * time", [
            unit("NO", "Potentially Not Occuring Number of plant species in terrestrial ecosystems * time (NO)", 1)
        ]),
        grandeur("D", "D - Potentially Disappeared Number of plant species in terrestrial ecosystems * time", [
            unit("D", "Potentially Disappeared Number of plant species in terrestrial ecosystems * time (D)", 1)
        ]),
        grandeur("AL", "AL - Disability Adjusted Life Years - Calculations adapted to USEtox midpoint (Huijbregts et al., 2005).", [
            unit("AL", "Disability Adjusted Life Years (AL)", 1)
        ]),
        grandeur("TU", "TU - Comparative Toxic Unit", [
            unit("TU", "Comparative Toxic Unit(TU) * volume * time", 1)
        ]),
        grandeur("Ene1", "Energie (J, kJ, MJ...)", [
            unit("MJ", "Méga-Joule", 1),
            unit("kJ", "Kilo-Joule", 0.001),
            unit("J", "Joule", 0.000001),
        ]),
        grandeur("Ene2", "Energie (Wh, kWh...)", [
            unit("Ws", "Watt-Seconde", 0.001 / 3600),
            unit("Wm", "Watt-Minute", 0.001 / 60),
            unit("Wh", "Watt-Heure", 0.001),
            unit("kWh", "KiloWatt-Heure", 1)
        ]),
        grandeur("Dens", "Densité (mol, mmol...)", [
            unit("μmol", "Micro-mole", 0.000001),
            unit("mmol", "Milli-mole", 0.001),
            unit("mol", "Mole", 1),
            unit("kmol", "Kilo-Mole", 1000)
        ]),
        grandeur("Nomb", "Nombre (pas d'unité)", [
            unit("Nomb", "pas d'unité", 1),
            unit("Item(s)", "items", 1)
        ]),
        grandeur("Volu", "Volume (L, m3...)", [
            unit("goutte", "Goutte", 0.001 * 20000),
            unit("L", "Litre", 0.001),
            unit("dL", "Déci-litre", 0.001 * 0.1),
            unit("cL", "Centi-litre", 0.001 * 0.01),
            unit("mL", "Milli-litre", 0.001 * 0.001),
            unit("m3", "Mètre-cube", 1),
            unit("0.001 m3", "Millième de Mètre-cube", 0.001),
        ]),
        grandeur("Duré", "Durée (sec, min, h...)", [
            unit("sec", "Seconde", 1),
            unit("min", "Minute", 60),
            unit("h", "Heure", 60 * 60),
            unit("j", "Jour", 60 * 60 * 24),
            unit("mois", "Mois", 60 * 60 * 24 * 30 * 355),
            unit("an", "Année", 60 * 60 * 24 * 30 * 355 * 12)
        ]),
        grandeur("Mass", "Masse (g, kg...)", [
            unit("mg", "Milligramme", 0.000001),
            unit("g", "Gramme", 0.001),
            unit("kg", "Kilo-gramme (kg)", 1),
            unit("t", "Tonne", 1000),
            unit("Mt", "Mega-tonne", 1000000)
        ]),
        grandeur("Surf", "Surface (m2, hec...)", [
            unit("m2", "Mètre-carré", 1),
            unit("cm2", "Centimètre-carré", 0.0001),
            unit("hec", "Hectare", 10000)
        ]),
        grandeur("Long", "Longueur (mm, m, km...)", [
            unit("mm", "Millimètre", 0.001),
            unit("cm", "Centimètre", 0.01),
            unit("m", "Mètre", 1),
            unit("km", "Kilo-mètre", 1000),
            unit("1000 m", "Kilo-mètre", 1000)
        ]),
        grandeur("Pri1", "Prix/Coût (€...)", [
            unit("M€", "milliard d'euros", 1000000000),
            unit("m€", "million d'euros", 1000000),
            unit("k€", "Kilo-euro", 1000),
            unit("€", "euo", 1),
        ]),
        grandeur("Pri2", "Prix/Coût (€...)", [
            unit("M$", "Milliard de dollars", 1000000),
            unit("m$", "Million de dollars", 1000000),
            unit("k$", "Kilo-dollar", 1000),
            unit("$", "dollar", 1),
        ]),
        grandeur("Tran", "Transport (t*km...)", [
            unit("t*km", "Tonne Kilomètre", 1),
            unit("kg*km", "Kilogramme Kilomètre", 0.001)
        ])
    ])