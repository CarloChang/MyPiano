import * as Tone from 'tone'
import { noteName, type MidiNote } from '../music/notes'
import { INSTRUMENTS, type InstrumentId } from './instruments'

// Cada instrumento se descarga la primera vez que lo eliges y luego se reutiliza.
const samplers = new Map<InstrumentId, { sampler: Tone.Sampler; ready: Promise<void> }>()
let current: Tone.Sampler | undefined

function getSampler(id: InstrumentId) {
  let entry = samplers.get(id)
  if (!entry) {
    const { baseUrl, samples, release } = INSTRUMENTS[id]
    // Tone quiere las notas con "#" y los archivos usan "s": { 'A#2': 'As2.mp3' }.
    const urls = Object.fromEntries(samples.map((file) => [file.replace('s', '#'), `${file}.mp3`]))
    let sampler!: Tone.Sampler
    const ready = new Promise<void>((resolve, reject) => {
      sampler = new Tone.Sampler({ urls, baseUrl, release, onload: resolve, onerror: reject }).toDestination()
    })
    entry = { sampler, ready }
    samplers.set(id, entry)
  }
  return entry
}

/** Cambia el instrumento. Se resuelve cuando sus muestras se han descargado. */
export function selectInstrument(id: InstrumentId): Promise<void> {
  // Apagamos lo que suene con el instrumento anterior para que no se quede colgado.
  current?.releaseAll()
  const { sampler, ready } = getSampler(id)
  current = sampler
  return ready
}

/** velocity va de 0 (muy suave) a 1 (fuerte). */
export function playNote(midi: MidiNote, velocity = 0.8): void {
  // El navegador no deja sonar audio hasta que el usuario interactúa con la
  // página; Tone.start() lo activa y no hace nada si ya está activo.
  void Tone.start()
  if (!current?.loaded) return
  current.triggerAttack(noteName(midi), Tone.now(), velocity)
}

export function stopNote(midi: MidiNote): void {
  if (!current?.loaded) return
  current.triggerRelease(noteName(midi), Tone.now())
}
