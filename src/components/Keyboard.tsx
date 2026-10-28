import type { PointerEvent } from 'react'
import { isBlackKey, noteName, type MidiNote } from '../music/notes'
import './Keyboard.css'

type KeyboardProps = {
  from: MidiNote // debe ser tecla blanca
  to: MidiNote
  activeNotes: ReadonlySet<MidiNote>
  onNoteOn: (midi: MidiNote) => void
  onNoteOff: (midi: MidiNote) => void
}

export function Keyboard({ from, to, activeNotes, onNoteOn, onNoteOff }: KeyboardProps) {
  const whiteKeys: MidiNote[] = []
  const blackKeys: { midi: MidiNote; whitesBefore: number }[] = []

  for (let midi = from; midi <= to; midi++) {
    if (isBlackKey(midi)) blackKeys.push({ midi, whitesBefore: whiteKeys.length })
    else whiteKeys.push(midi)
  }

  const whiteWidth = 100 / whiteKeys.length

  // Eventos comunes a blancas y negras. Al arrastrar con el botón pulsado
  // (glissando) se van tocando las teclas por las que pasas.
  const handlers = (midi: MidiNote) => ({
    onPointerDown: (e: PointerEvent) => {
      // En pantallas táctiles el dedo queda "capturado" por la primera tecla;
      // lo liberamos para que el glissando funcione también ahí.
      e.currentTarget.releasePointerCapture(e.pointerId)
      onNoteOn(midi)
    },
    onPointerEnter: (e: PointerEvent) => {
      if (e.buttons === 1) onNoteOn(midi)
    },
    onPointerUp: () => onNoteOff(midi),
    onPointerLeave: () => onNoteOff(midi),
  })

  return (
    <div className="keyboard">
      {whiteKeys.map((midi) => (
        <div
          key={midi}
          className={`key white${activeNotes.has(midi) ? ' active' : ''}`}
          {...handlers(midi)}
        >
          <span className="label">{noteName(midi)}</span>
        </div>
      ))}
      {blackKeys.map(({ midi, whitesBefore }) => (
        <div
          key={midi}
          className={`key black${activeNotes.has(midi) ? ' active' : ''}`}
          style={{ left: `${whitesBefore * whiteWidth}%`, width: `${whiteWidth * 0.6}%` }}
          {...handlers(midi)}
        />
      ))}
    </div>
  )
}