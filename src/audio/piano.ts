import * as Tone from 'tone'
import { noteName, type MidiNote } from '../music/notes'

// Grabaciones del piano "Salamander Grand" que publica Tone.js.
const BASE_URL = 'https://tonejs.github.io/audio/salamander/'

// Hay una muestra cada 3 semitonos (C, D#, F#, A). El Sampler calcula las
// notas intermedias cambiando un poco la velocidad de la más cercana.
function sampleUrls(): Record<string, string> {
  const urls: Record<string, string> = { A0: 'A0.mp3', C8: 'C8.mp3' }
  for (let octave = 1; octave <= 7; octave++) {
    for (const pitch of ['C', 'D#', 'F#', 'A']) {
      urls[`${pitch}${octave}`] = `${pitch.replace('#', 's')}${octave}.mp3`
    }
  }
  return urls
}

Tone.setContext(new Tone.Context({ latencyHint: 'interactive', lookAhead: 0 }))

const sampler = new Tone.Sampler({
  urls: sampleUrls(),
  baseUrl: BASE_URL,
  release: 1,
}).toDestination()

/** Se resuelve cuando se han descargado todas las muestras. */
export const pianoLoaded: Promise<void> = Tone.loaded()

/** velocity va de 0 (muy suave) a 1 (fuerte). */
export function playNote(midi: MidiNote, velocity = 0.8): void {
  // El navegador no deja sonar audio hasta que el usuario interactúa con la
  // página; Tone.start() lo activa y no hace nada si ya está activo.
  void Tone.start()
  if (!sampler.loaded) return
  sampler.triggerAttack(noteName(midi), Tone.immediate(), velocity)
}

export function stopNote(midi: MidiNote): void {
  if (!sampler.loaded) return
  sampler.triggerRelease(noteName(midi), Tone.immediate())
}
