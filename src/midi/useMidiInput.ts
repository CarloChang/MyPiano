import { useEffect, useRef, useState } from 'react'
import type { MidiNote } from '../music/notes'

export type MidiStatus =
  | { kind: 'unsupported' }
  | { kind: 'denied' }
  | { kind: 'pending' }
  | { kind: 'ready'; inputs: string[] }

const NOTE_OFF = 0x80
const NOTE_ON = 0x90
const CONTROL_CHANGE = 0xb0
const SUSTAIN_PEDAL = 64 // número de controlador estándar del pedal derecho

/**
 * Escucha todos los teclados MIDI conectados (USB o Bluetooth) y avisa de cada
 * nota. velocity va de 0 a 1, igual que en playNote.
 */
export function useMidiInput(
  onNoteOn: (midi: MidiNote, velocity: number) => void,
  onNoteOff: (midi: MidiNote) => void,
  onSustain: (down: boolean) => void,
): MidiStatus {
  const [status, setStatus] = useState<MidiStatus>(() =>
    'requestMIDIAccess' in navigator ? { kind: 'pending' } : { kind: 'unsupported' },
  )

  // Las funciones de App cambian en cada render; guardamos siempre la última
  // para no tener que volver a conectar el MIDI cada vez.
  const handlers = useRef({ onNoteOn, onNoteOff, onSustain })
  useEffect(() => {
    handlers.current = { onNoteOn, onNoteOff, onSustain }
  })

  useEffect(() => {
    if (!('requestMIDIAccess' in navigator)) return
    let access: MIDIAccess | undefined
    let cancelled = false

    const onMessage = (e: MIDIMessageEvent) => {
      if (!e.data || e.data.length < 3) return
      const [status, note, velocity] = e.data
      const command = status & 0xf0 // los 4 bits bajos son el canal
      // Muchos teclados mandan "note on" con velocidad 0 en vez de "note off".
      if (command === NOTE_ON && velocity > 0) handlers.current.onNoteOn(note, velocity / 127)
      else if (command === NOTE_OFF || command === NOTE_ON) handlers.current.onNoteOff(note)
      // Algunos pedales mandan valores intermedios (medio pedal); a partir de
      // la mitad lo consideramos pisado.
      else if (command === CONTROL_CHANGE && note === SUSTAIN_PEDAL) handlers.current.onSustain(velocity >= 64)
    }

    // Se llama al empezar y cada vez que conectas o desconectas un teclado.
    const connectInputs = () => {
      if (!access) return
      const names: string[] = []
      access.inputs.forEach((input) => {
        input.onmidimessage = onMessage
        names.push(input.name ?? 'Teclado MIDI')
      })
      setStatus({ kind: 'ready', inputs: names })
    }

    navigator.requestMIDIAccess().then(
      (result) => {
        if (cancelled) return
        access = result
        access.onstatechange = connectInputs
        connectInputs()
      },
      () => !cancelled && setStatus({ kind: 'denied' }),
    )

    return () => {
      cancelled = true
      if (!access) return
      access.onstatechange = null
      access.inputs.forEach((input) => (input.onmidimessage = null))
    }
  }, [])

  return status
}
