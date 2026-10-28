export type Instrument = {
  label: string
  baseUrl: string
  // Notas grabadas, con el nombre del archivo: "As2" es A#2 → "As2.mp3".
  // El Sampler calcula las notas intermedias a partir de la más cercana.
  samples: string[]
  release: number // segundos que tarda en apagarse al soltar la tecla
}

// Grabaciones de https://github.com/nbrosowsky/tonejs-instruments
const NBROSOWSKY = 'https://nbrosowsky.github.io/tonejs-instruments/samples/'

/** Las teclas de una octava a la otra, en el formato de los nombres de archivo. */
function range(pitches: string[], fromOctave: number, toOctave: number): string[] {
  const notes: string[] = []
  for (let octave = fromOctave; octave <= toOctave; octave++) {
    for (const pitch of pitches) notes.push(`${pitch}${octave}`)
  }
  return notes
}

export const INSTRUMENTS = {
  piano: {
    label: 'Piano',
    // Piano "Salamander Grand" que publica Tone.js: una muestra cada 3 semitonos.
    baseUrl: 'https://tonejs.github.io/audio/salamander/',
    samples: ['A0', ...range(['C', 'Ds', 'Fs', 'A'], 1, 7), 'C8'],
    release: 1,
  },
  'guitar-acoustic': {
    label: 'Guitarra acústica',
    baseUrl: NBROSOWSKY + 'guitar-acoustic/',
    samples: ['E2', 'Fs2', 'Gs2', 'As2', ...range(['C', 'D', 'E', 'Fs', 'Gs', 'As'], 3, 4), 'C5', 'D5'],
    release: 1,
  },
  'guitar-electric': {
    label: 'Guitarra eléctrica',
    baseUrl: NBROSOWSKY + 'guitar-electric/',
    samples: ['E2', 'Fs2', 'A2', 'C3', 'Ds3', 'Fs3', 'A3', 'C4', 'Ds4', 'Fs4', 'A4', 'C5', 'Ds5', 'Fs5', 'A5', 'C6'],
    release: 1,
  },
  violin: {
    label: 'Violín',
    baseUrl: NBROSOWSKY + 'violin/',
    samples: ['G3', 'A3', 'C4', 'E4', 'G4', 'A4', 'C5', 'E5', 'G5', 'A5', 'C6', 'E6', 'G6', 'A6', 'C7'],
    release: 0.5,
  },
  cello: {
    label: 'Violonchelo',
    baseUrl: NBROSOWSKY + 'cello/',
    samples: ['C2', 'D2', 'E2', 'Gs2', 'As2', ...range(['C', 'D', 'E', 'Fs', 'Gs', 'As'], 3, 3), 'C4', 'D4', 'E4', 'Fs4', 'Gs4', 'C5'],
    release: 0.5,
  },
  organ: {
    label: 'Órgano',
    baseUrl: NBROSOWSKY + 'organ/',
    samples: [...range(['C', 'Ds', 'Fs', 'A'], 1, 5), 'C6'],
    release: 0.3,
  },
  flute: {
    label: 'Flauta',
    baseUrl: NBROSOWSKY + 'flute/',
    samples: ['C4', 'E4', 'A4', 'C5', 'E5', 'A5', 'C6', 'E6', 'A6', 'C7'],
    release: 0.5,
  },
  saxophone: {
    label: 'Saxofón',
    baseUrl: NBROSOWSKY + 'saxophone/',
    samples: ['Cs3', 'Ds3', 'F3', 'G3', 'B3', ...range(['Cs', 'Ds', 'F', 'G', 'A'], 4, 5)],
    release: 0.4,
  },
  harp: {
    label: 'Arpa',
    baseUrl: NBROSOWSKY + 'harp/',
    samples: ['E1', 'G1', 'B1', 'D2', 'F2', 'A2', 'C3', 'E3', 'G3', 'B3', 'D4', 'F4', 'A4', 'C5', 'E5', 'G5', 'B5', 'D6', 'F6', 'A6', 'D7', 'F7'],
    release: 1.5,
  },
  xylophone: {
    label: 'Xilófono',
    baseUrl: NBROSOWSKY + 'xylophone/',
    samples: ['G4', 'C5', 'G5', 'C6', 'G6', 'C7', 'G7', 'C8'],
    release: 1,
  },
} satisfies Record<string, Instrument>

export type InstrumentId = keyof typeof INSTRUMENTS
