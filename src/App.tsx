import { useEffect, useState } from 'react'
import { pianoLoaded, playNote, stopNote } from './audio/piano'
import { Keyboard } from './components/Keyboard'
import { detectChords } from './music/chords'
import { useMidiInput, type MidiStatus } from './midi/useMidiInput'
import { noteName, type MidiNote } from './music/notes'

function App() {
  const [activeNotes, setActiveNotes] = useState<ReadonlySet<MidiNote>>(new Set())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    pianoLoaded.then(() => setLoaded(true))
  }, [])

  const noteOn = (midi: MidiNote, velocity?: number) => {
    playNote(midi, velocity)
    setActiveNotes((prev) => (prev.has(midi) ? prev : new Set(prev).add(midi)))
  }

  const noteOff = (midi: MidiNote) => {
    stopNote(midi)
    setActiveNotes((prev) => {
      if (!prev.has(midi)) return prev
      const next = new Set(prev)
      next.delete(midi)
      return next
    })
  }

  const midi = useMidiInput(noteOn, noteOff)

  const playing = [...activeNotes].sort((a, b) => a - b)
  const [chord, ...alternatives] = detectChords(activeNotes)

  return (
    <main>
      <h1>MyPiano</h1>
      <p className="midi-status">{midiStatusText(midi)}</p>
      <p>{loaded ? (playing.length ? playing.map(noteName).join(' · ') : '—') : 'Cargando sonido…'}</p>
      <div className="chord">
        {chord && (
          <>
            <span className="chord-symbol">{chord.symbol}</span>
            <span className="chord-name">{chord.name}</span>
            {alternatives.length > 0 && (
              <span className="chord-alternatives">
                También: {alternatives.map((c) => c.symbol).join(', ')}
              </span>
            )}
          </>
        )}
      </div>
      <Keyboard from={21} to={108} activeNotes={activeNotes} onNoteOn={noteOn} onNoteOff={noteOff} />
    </main>
  )
}

function midiStatusText(status: MidiStatus): string {
  switch (status.kind) {
    case 'unsupported':
      return 'Este navegador no admite MIDI. Usa Chrome o Edge para conectar tu piano.'
    case 'denied':
      return 'No se dio permiso para usar MIDI. Actívalo en la configuración del sitio.'
    case 'pending':
      return 'Buscando teclados MIDI…'
    case 'ready':
      return status.inputs.length
        ? `Piano conectado: ${status.inputs.join(', ')}`
        : 'Conecta tu piano por USB para tocar con él.'
  }
}

export default App
