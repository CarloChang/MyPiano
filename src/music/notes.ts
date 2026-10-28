import { Note } from 'tonal'

export type MidiNote = number

export function noteName(midi: MidiNote) : string {
    return Note.fromMidiSharps(midi)
}

export function isBlackKey(midi: MidiNote): boolean {
    return Note.get(noteName(midi)).acc !== ''
}