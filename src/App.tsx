import { useEffect, useRef, useState } from 'react'
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

  // Notas que ya soltaste pero siguen sonando porque el pedal está pisado.
  // Los refs son para la lógica (siempre al día entre eventos MIDI seguidos);
  // los estados, para que la pantalla se actualice.
  const pedalDown = useRef(false)
  const sustained = useRef(new Set<MidiNote>())
  const [pedal, setPedal] = useState(false)
  const [sustainedNotes, setSustainedNotes] = useState<ReadonlySet<MidiNote>>(new Set())

  const updateSustained = (change: (notes: Set<MidiNote>) => void) => {
    change(sustained.current)
    setSustainedNotes(new Set(sustained.current))
  }

  const noteOn = (midi: MidiNote, velocity?: number) => {
    playNote(midi, velocity)
    // Si la nota seguía sonando por el pedal, ahora vuelve a estar pulsada.
    if (sustained.current.has(midi)) updateSustained((notes) => notes.delete(midi))
    setActiveNotes((prev) => (prev.has(midi) ? prev : new Set(prev).add(midi)))
  }

  const noteOff = (midi: MidiNote) => {
    if (pedalDown.current) updateSustained((notes) => notes.add(midi))
    else stopNote(midi)
    setActiveNotes((prev) => {
      if (!prev.has(midi)) return prev
      const next = new Set(prev)
      next.delete(midi)
      return next
    })
  }

  const sustain = (down: boolean) => {
    if (down === pedalDown.current) return
    pedalDown.current = down
    setPedal(down)
    if (!down) {
      sustained.current.forEach(stopNote)
      updateSustained((notes) => notes.clear())
    }
  }

  const midi = useMidiInput(noteOn, noteOff, sustain)

  // Lo que suena ahora: teclas pulsadas más las que mantiene el pedal. Así el
  // acorde se reconoce también si lo tocas arpegiado con el pedal pisado.
  const sounding = new Set([...activeNotes, ...sustainedNotes])
  const playing = [...sounding].sort((a, b) => a - b)
  const [chord, ...alternatives] = detectChords(sounding)

  return (
    <main>
      <h1>MyPiano</h1>
      <p className="midi-status">
        {midiStatusText(midi)}
        <span className={`pedal${pedal ? ' down' : ''}`}>Pedal</span>
      </p>
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
