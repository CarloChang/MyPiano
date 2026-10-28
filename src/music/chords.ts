import { Chord } from 'tonal'
import { pitchClass, type MidiNote } from './notes'

export type DetectedChord = {
  symbol: string // "C", "C7", "C7/Bb"
  name: string // "C major", "C dominant seventh over Bb"
}

// Tonal devuelve varias lecturas posibles de las mismas notas y a veces pone
// primero una rara (E G C → "Em#5" antes que "C/E"). Damos preferencia a los
// acordes de uso común; dentro de cada grupo se mantiene el orden de Tonal.
const COMMON_TYPES = new Set([
  'major',
  'minor',
  'dominant seventh',
  'major seventh',
  'minor seventh',
  'diminished',
  'augmented',
  'half-diminished',
  'diminished seventh',
  'minor/major seventh',
  'suspended fourth',
  'suspended second',
  'sixth',
  'minor sixth',
  'dominant ninth',
  'major ninth',
  'minor ninth',
  'seventh suspended fourth',
])

/** Acordes que forman las notas, del más probable al menos probable. */
export function detectChords(notes: Iterable<MidiNote>): DetectedChord[] {
  // Del más grave al más agudo: la nota del bajo decide las inversiones.
  const sorted = [...notes].sort((a, b) => a - b)
  const pitchClasses = [...new Set(sorted.map(pitchClass))]

  return Chord.detect(pitchClasses, { assumePerfectFifth: true })
    .map((symbol) => ({ symbol, chord: Chord.get(symbol) }))
    .sort((a, b) => Number(COMMON_TYPES.has(b.chord.type)) - Number(COMMON_TYPES.has(a.chord.type)))
    .map(({ symbol, chord }) => ({
      // Tonal escribe "CM" para el mayor; lo normal es escribir solo "C".
      symbol: symbol.replace(/^([A-G][#b]?)M(?=$|\/)/, '$1'),
      name: chord.name.trim() || symbol,
    }))
}
