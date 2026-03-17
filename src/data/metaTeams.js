export const META_TEAMS = {
  uber: [
    {
      name: "Uber - Ofensivo Psíquico",
      pokemon: [
        {
          id: 150,
          moves: ["Psíquico", "Rayo Hielo", "Recuperación", "Paz Mental"],
        }, // Mewtwo
        { id: 151, moves: ["Psíquico", "Terremoto", "Rayo Hielo", "Reflejo"] }, // Mew
        { id: 249, moves: ["Psíquico", "Vuelo", "Recuperación", "Rayo Hielo"] }, // Lugia
        { id: 250, moves: ["Sofoco", "Pájaro Osado", "Terremoto", "Rayo"] }, // Ho-Oh
        {
          id: 149,
          moves: ["Garra Dragón", "Terremoto", "Danza Dragón", "Rayo Hielo"],
        }, // Dragonite
        {
          id: 248,
          moves: ["Avalancha", "Triturar", "Terremoto", "Pulso Umbrío"],
        }, // Tyranitar
      ],
    },
    {
      name: "Uber - Defensivo / Stall",
      pokemon: [
        {
          id: 242,
          moves: ["Recuperación", "Hiperrayo", "Rayo Hielo", "Pantalla de Luz"],
        }, // Blissey
        {
          id: 143,
          moves: ["Golpe Cuerpo", "Terremoto", "Recuperación", "Puño Hielo"],
        }, // Snorlax
        {
          id: 249,
          moves: ["Psíquico", "Recuperación", "Reflejo", "Rayo Hielo"],
        }, // Lugia
        { id: 248, moves: ["Avalancha", "Tormenta Arena", "Triturar", "Rayo"] }, // Tyranitar
        {
          id: 251,
          moves: ["Psíquico", "Síntesis", "Rayo Solar", "Recuperación"],
        }, // Celebi
        {
          id: 113,
          moves: ["Recuperación", "Rayo Hielo", "Gruñido", "Pantalla de Luz"],
        }, // Chansey
      ],
    },
    {
      name: "Uber - Dragones y legendarios",
      pokemon: [
        {
          id: 149,
          moves: ["Garra Dragón", "Pájaro Osado", "Danza Dragón", "Terremoto"],
        }, // Dragonite
        { id: 150, moves: ["Psíquico", "Rayo", "Paz Mental", "Recuperación"] }, // Mewtwo
        {
          id: 151,
          moves: ["Brillo Mágico", "Terremoto", "Rayo Hielo", "Reflejo"],
        }, // Mew
        { id: 248, moves: ["Avalancha", "Triturar", "Roca Afilada", "Fuerza"] }, // Tyranitar
        {
          id: 250,
          moves: ["Llamarada", "Pájaro Osado", "Terremoto", "Descanso"],
        }, // Ho-Oh
        { id: 249, moves: ["Psíquico", "Vuelo", "Recuperación", "Rayo"] }, // Lugia
      ],
    },
  ],

  ou: [
    {
      name: "OU - Ofensivo físico",
      pokemon: [
        {
          id: 6,
          moves: ["Lanzallamas", "Pájaro Osado", "Terremoto", "Danza Dragón"],
        }, // Charizard
        {
          id: 68,
          moves: ["Ultrapuño", "Demolición", "Terremoto", "Puño Fuego"],
        }, // Machamp
        {
          id: 130,
          moves: ["Cascada", "Pájaro Osado", "Terremoto", "Danza Dragón"],
        }, // Gyarados
        {
          id: 128,
          moves: [
            "Golpe Cuerpo",
            "Hiperrayo",
            "Terremoto",
            "Velocidad Extrema",
          ],
        }, // Tauros
        {
          id: 59,
          moves: [
            "Lanzallamas",
            "Terremoto",
            "Velocidad Extrema",
            "Puño Fuego",
          ],
        }, // Arcanine
        { id: 94, moves: ["Bola Sombra", "Puño Sombra", "Rayo", "Psíquico"] }, // Gengar
      ],
    },
    {
      name: "OU - Ofensivo especial",
      pokemon: [
        { id: 65, moves: ["Psíquico", "Rayo Hielo", "Rayo", "Recuperación"] }, // Alakazam
        { id: 121, moves: ["Surf", "Psíquico", "Rayo Hielo", "Recuperación"] }, // Starmie
        { id: 135, moves: ["Rayo", "Trueno", "Bola Voltio", "Rayo Hielo"] }, // Jolteon
        { id: 145, moves: ["Trueno", "Rayo", "Tornado", "Rayo Hielo"] }, // Zapdos
        {
          id: 157,
          moves: ["Lanzallamas", "Sofoco", "Rayo Hielo", "Día Soleado"],
        }, // Typhlosion
        {
          id: 230,
          moves: ["Surf", "Pulso Dragón", "Rayo Hielo", "Cometa Draco"],
        }, // Kingdra
      ],
    },
    {
      name: "OU - Mixto / Equilibrio",
      pokemon: [
        {
          id: 149,
          moves: ["Garra Dragón", "Terremoto", "Rayo Hielo", "Danza Dragón"],
        }, // Dragonite
        { id: 248, moves: ["Avalancha", "Triturar", "Terremoto", "Rayo"] }, // Tyranitar
        { id: 94, moves: ["Bola Sombra", "Rayo", "Psíquico", "Puño Fuego"] }, // Gengar
        { id: 62, moves: ["Surf", "Ultrapuño", "Terremoto", "Rayo Hielo"] }, // Poliwrath
        {
          id: 212,
          moves: [
            "Tijera X",
            "Cabeza de Hierro",
            "Puño Bala",
            "Velocidad Extrema",
          ],
        }, // Scizor
        { id: 181, moves: ["Rayo", "Trueno", "Bola Voltio", "Puño Trueno"] }, // Ampharos
      ],
    },
    {
      name: "OU - Defensivo / Weather (Sand)",
      pokemon: [
        {
          id: 248,
          moves: ["Avalancha", "Triturar", "Tormenta Arena", "Roca Afilada"],
        }, // Tyranitar
        {
          id: 208,
          moves: [
            "Cuerpo Pesado",
            "Terremoto",
            "Tormenta Arena",
            "Roca Afilada",
          ],
        }, // Steelix
        {
          id: 232,
          moves: ["Terremoto", "Avalancha", "Tormenta Arena", "Puño Fuego"],
        }, // Donphan
        {
          id: 227,
          moves: [
            "Cabeza de Hierro",
            "Pájaro Osado",
            "Defensa Férrea",
            "Tornado",
          ],
        }, // Skarmory
        {
          id: 143,
          moves: ["Golpe Cuerpo", "Terremoto", "Recuperación", "Puño Fuego"],
        }, // Snorlax
        {
          id: 205,
          moves: [
            "Cabeza de Hierro",
            "Terremoto",
            "Tormenta Arena",
            "Explosión",
          ],
        }, // Forretress
      ],
    },
    {
      name: "OU - Lluvia",
      pokemon: [
        { id: 9, moves: ["Surf", "Hidrobomba", "Rayo Hielo", "Danza Lluvia"] }, // Blastoise
        {
          id: 230,
          moves: ["Surf", "Pulso Dragón", "Rayo Hielo", "Danza Lluvia"],
        }, // Kingdra
        { id: 121, moves: ["Surf", "Rayo", "Rayo Hielo", "Danza Lluvia"] }, // Starmie
        { id: 131, moves: ["Surf", "Rayo Hielo", "Descanso", "Danza Lluvia"] }, // Lapras
        { id: 62, moves: ["Surf", "Ultrapuño", "Terremoto", "Danza Lluvia"] }, // Poliwrath
        { id: 171, moves: ["Surf", "Rayo", "Rayo Hielo", "Danza Lluvia"] }, // Lanturn
      ],
    },
    {
      name: "OU - Sol",
      pokemon: [
        {
          id: 6,
          moves: ["Lanzallamas", "Pájaro Osado", "Día Soleado", "Rayo Solar"],
        }, // Charizard
        {
          id: 157,
          moves: ["Lanzallamas", "Sofoco", "Día Soleado", "Rayo Solar"],
        }, // Typhlosion
        { id: 136, moves: ["Lanzallamas", "Sofoco", "Día Soleado", "Rayo"] }, // Flareon
        {
          id: 59,
          moves: ["Lanzallamas", "Terremoto", "Día Soleado", "Puño Fuego"],
        }, // Arcanine
        {
          id: 146,
          moves: ["Lanzallamas", "Sofoco", "Día Soleado", "Pájaro Osado"],
        }, // Moltres
        {
          id: 3,
          moves: ["Rayo Solar", "Bomba Lodo", "Síntesis", "Día Soleado"],
        }, // Venusaur
      ],
    },
    {
      name: "OU - Trick Room",
      pokemon: [
        {
          id: 143,
          moves: ["Golpe Cuerpo", "Terremoto", "Puño Fuego", "Recuperación"],
        }, // Snorlax
        {
          id: 248,
          moves: ["Avalancha", "Triturar", "Terremoto", "Roca Afilada"],
        }, // Tyranitar
        {
          id: 76,
          moves: ["Roca Afilada", "Terremoto", "Puño Fuego", "Cuerpo Pesado"],
        }, // Golem
        {
          id: 112,
          moves: ["Terremoto", "Roca Afilada", "Puño Fuego", "Cuerpo Pesado"],
        }, // Rhydon
        { id: 80, moves: ["Surf", "Psíquico", "Rayo Hielo", "Reflejo"] }, // Slowbro
        { id: 199, moves: ["Surf", "Psíquico", "Rayo Hielo", "Amnesia"] }, // Slowking
      ],
    },
  ],

  uu: [
    {
      name: "UU - Ofensivo",
      pokemon: [
        { id: 85, moves: ["Pájaro Osado", "Vuelo", "Fuerza", "Triturar"] }, // Dodrio
        {
          id: 169,
          moves: ["Bomba Lodo", "Pájaro Osado", "Tajo Umbrío", "Fuerza"],
        }, // Crobat
        {
          id: 237,
          moves: ["Patada Ígnea", "Ultrapuño", "Demolición", "Terremoto"],
        }, // Hitmontop
      ],
    },
    {
      name: "UU - Equilibrio",
      pokemon: [
        {
          id: 36,
          moves: ["Brillo Mágico", "Recuperación", "Rayo Hielo", "Reflejo"],
        }, // Clefable
        { id: 38, moves: ["Lanzallamas", "Rayo", "Psíquico", "Día Soleado"] }, // Ninetales
        { id: 85, moves: ["Pájaro Osado", "Vuelo", "Fuerza", "Triturar"] }, // Dodrio
        { id: 93, moves: ["Bola Sombra", "Rayo", "Psíquico", "Puño Sombra"] }, // Haunter
        {
          id: 105,
          moves: ["Terremoto", "Excavar", "Roca Afilada", "Golpe Cuerpo"],
        }, // Marowak
        { id: 171, moves: ["Surf", "Rayo", "Rayo Hielo", "Reflejo"] }, // Lanturn
      ],
    },
    {
      name: "UU - Defensivo",
      pokemon: [
        { id: 97, moves: ["Psíquico", "Rayo Hielo", "Reflejo", "Amnesia"] }, // Hypno
        {
          id: 114,
          moves: ["Rayo Solar", "Síntesis", "Terremoto", "Bomba Lodo"],
        }, // Tangela
        { id: 195, moves: ["Surf", "Terremoto", "Rayo Hielo", "Fuerza"] }, // Quagsire
        { id: 200, moves: ["Bola Sombra", "Psíquico", "Rayo", "Infortunio"] }, // Misdreavus
        {
          id: 207,
          moves: ["Terremoto", "Tajo Umbrío", "Pájaro Osado", "Fuerza"],
        }, // Gligar
        {
          id: 241,
          moves: ["Golpe Cuerpo", "Recuperación", "Terremoto", "Reflejo"],
        }, // Miltank
      ],
    },
    {
      name: "UU - Weather (Rain)",
      pokemon: [
        { id: 186, moves: ["Surf", "Rayo Hielo", "Psíquico", "Danza Lluvia"] }, // Politoed
        { id: 171, moves: ["Surf", "Rayo", "Rayo Hielo", "Danza Lluvia"] }, // Lanturn
        {
          id: 119,
          moves: ["Cascada", "Acua Cola", "Rayo Hielo", "Danza Lluvia"],
        }, // Seaking
        { id: 224, moves: ["Surf", "Rayo Hielo", "Psíquico", "Danza Lluvia"] }, // Octillery
        { id: 226, moves: ["Surf", "Rayo Hielo", "Vuelo", "Danza Lluvia"] }, // Mantine
        {
          id: 99,
          moves: ["Cascada", "Acua Cola", "Terremoto", "Danza Lluvia"],
        }, // Kingler
      ],
    },
    {
      name: "UU - Trick Room",
      pokemon: [
        {
          id: 105,
          moves: ["Terremoto", "Roca Afilada", "Golpe Cuerpo", "Puño Fuego"],
        }, // Marowak
        {
          id: 108,
          moves: ["Golpe Cuerpo", "Terremoto", "Puño Hielo", "Hiperrayo"],
        }, // Lickitung
        {
          id: 185,
          moves: ["Avalancha", "Terremoto", "Roca Afilada", "Fuerza"],
        }, // Sudowoodo
        { id: 202, moves: ["Contraataque", "Voz Cautivadora"] }, // Wobbuffet
        {
          id: 203,
          moves: ["Psíquico", "Golpe Cuerpo", "Rayo Hielo", "Fuerza"],
        }, // Girafarig
        {
          id: 213,
          moves: ["Plancha", "Lanzarrocas", "Terremoto", "Red Viscosa"],
        }, // Shuckle
      ],
    },
  ],

  nu: [
    {
      name: "NU - Ofensivo físico",
      pokemon: [
        { id: 20, moves: ["Golpe Cuerpo", "Hiperrayo", "Triturar", "Excavar"] }, // Raticate
        { id: 22, moves: ["Pájaro Osado", "Vuelo", "Fuerza", "Hiperrayo"] }, // Fearow
        {
          id: 2,
          moves: ["Látigo Cepa", "Rayo Solar", "Bomba Lodo", "Síntesis"],
        }, // Ivysaur
        { id: 5, moves: ["Lanzallamas", "Puño Fuego", "Terremoto", "Fuerza"] }, // Charmeleon
        { id: 8, moves: ["Surf", "Rayo Hielo", "Fuerza", "Refugio"] }, // Wartortle
        { id: 15, moves: ["Picadura", "Tijera X", "Bomba Lodo", "Excavar"] }, // Beedrill
        { id: 49, moves: ["Zumbido", "Psíquico", "Bomba Lodo", "Gigadrenado"] }, // Venomoth
        { id: 47, moves: ["Tijera X", "Rayo Solar", "Terremoto", "Fuerza"] }, // Parasect
      ],
    },
    {
      name: "NU - Ofensivo especial",
      pokemon: [
        { id: 12, moves: ["Zumbido", "Psíquico", "Gigadrenado", "Tornado"] }, // Butterfree
        { id: 49, moves: ["Zumbido", "Psíquico", "Bomba Lodo", "Gigadrenado"] }, // Venomoth
        { id: 44, moves: ["Rayo Solar", "Bomba Lodo", "Síntesis", "Fuerza"] }, // Gloom
        { id: 70, moves: ["Rayo Solar", "Hoja Aguda", "Bomba Lodo", "Fuerza"] }, // Weepinbell
        { id: 18, moves: ["Pájaro Osado", "Vuelo", "Hiperrayo", "Fuerza"] }, // Pidgeot
      ],
    },
    {
      name: "NU - Defensivo",
      pokemon: [
        {
          id: 1,
          moves: ["Látigo Cepa", "Rayo Solar", "Síntesis", "Bomba Lodo"],
        }, // Bulbasaur
        { id: 7, moves: ["Pistola Agua", "Surf", "Refugio", "Rayo Hielo"] }, // Squirtle
        { id: 16, moves: ["Placaje", "Tornado", "Pájaro Osado", "Fuerza"] }, // Pidgey
        { id: 19, moves: ["Placaje", "Golpe Cuerpo", "Triturar", "Mordisco"] }, // Rattata
        { id: 21, moves: ["Picotazo", "Pájaro Osado", "Tornado", "Fuerza"] }, // Spearow
        { id: 23, moves: ["Bomba Lodo", "Tóxico", "Terremoto", "Mordisco"] }, // Ekans
      ],
    },
    {
      name: "NU - Weather (Sun)",
      pokemon: [
        {
          id: 5,
          moves: ["Lanzallamas", "Puño Fuego", "Día Soleado", "Rayo Solar"],
        }, // Charmeleon
        { id: 37, moves: ["Lanzallamas", "Rayo", "Día Soleado", "Psíquico"] }, // Vulpix
        {
          id: 4,
          moves: ["Ascuas", "Lanzallamas", "Día Soleado", "Puño Fuego"],
        }, // Charmander
        {
          id: 58,
          moves: ["Lanzallamas", "Terremoto", "Día Soleado", "Puño Fuego"],
        }, // Growlithe
        {
          id: 77,
          moves: ["Lanzallamas", "Terremoto", "Día Soleado", "Puño Fuego"],
        }, // Ponyta
        {
          id: 2,
          moves: ["Rayo Solar", "Síntesis", "Día Soleado", "Bomba Lodo"],
        }, // Ivysaur
      ],
    },
  ],

  pu: [
    {
      name: "PU - Básico",
      pokemon: [
        { id: 17, moves: ["Placaje", "Tornado", "Pájaro Osado", "Fuerza"] }, // Pidgeotto
        { id: 19, moves: ["Placaje", "Golpe Cuerpo", "Triturar", "Mordisco"] }, // Rattata
        {
          id: 52,
          moves: ["Golpe Cuerpo", "Fuerza", "Tajo Umbrío", "Triturar"],
        }, // Meowth
        { id: 21, moves: ["Picotazo", "Pájaro Osado", "Tornado", "Fuerza"] }, // Spearow
        { id: 23, moves: ["Bomba Lodo", "Tóxico", "Terremoto", "Mordisco"] }, // Ekans
        { id: 129, moves: ["Placaje", "Cascada"] }, // Magikarp
      ],
    },
    {
      name: "PU - Ofensivo",
      pokemon: [
        { id: 16, moves: ["Placaje", "Tornado", "Pájaro Osado", "Fuerza"] }, // Pidgey
        { id: 60, moves: ["Pistola Agua", "Surf", "Rayo Hielo", "Fuerza"] }, // Poliwag
      ],
    },
    {
      name: "PU - Defensivo",
      pokemon: [
        { id: 16, moves: ["Placaje", "Tornado", "Reflejo", "Fuerza"] }, // Pidgey
        { id: 19, moves: ["Placaje", "Golpe Cuerpo", "Mordisco", "Triturar"] }, // Rattata
        { id: 21, moves: ["Picotazo", "Tornado", "Fuerza", "Reflejo"] }, // Spearow
        { id: 23, moves: ["Bomba Lodo", "Tóxico", "Ácido", "Mordisco"] }, // Ekans
        { id: 52, moves: ["Golpe Cuerpo", "Tajo Umbrío", "Fuerza", "Reflejo"] }, // Meowth
        { id: 60, moves: ["Pistola Agua", "Surf", "Refugio", "Rayo Hielo"] }, // Poliwag
      ],
    },
  ],
};
