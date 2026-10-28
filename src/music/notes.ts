import { Note } from 'tonal'

export type MidiNote = number

// La escritura más habitual de cada tecla negra (Bb mejor que A#, F# mejor que Gb).
const PITCH_CLASSES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

/** Nombre sin octava: 70 → "Bb". */
export function pitchClass(midi: MidiNote): string {
    return PITCH_CLASSES[midi % 12]
}

/** Nombre con octava: 70 → "Bb4". */
export function noteName(midi: MidiNote) : string {
    return pitchClass(midi) + (Math.floor(midi / 12) - 1)
}

export function isBlackKey(midi: MidiNote): boolean {
    return Note.get(noteName(midi)).acc !== ''
}
