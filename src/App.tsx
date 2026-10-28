import { useEffect, useState } from 'react'
import { pianoLoaded, playNote, stopNote } from './audio/piano'
import { Keyboard } from './components/Keyboard'
import { noteName, type MidiNote } from './music/notes'

function App() {
  const [activeNotes, setActiveNotes] = useState<ReadonlySet<MidiNote>>(new Set())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    pianoLoaded.then(() => setLoaded(true))
  }, [])

  const noteOn = (midi: MidiNote) => {
    playNote(midi)
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

  const playing = [...activeNotes].sort((a, b) => a - b)

  return (
    <main>
      <h1>MyPiano</h1>
      <p>{loaded ? (playing.length ? playing.map(noteName).join(' · ') : '—') : 'Cargando sonido…'}</p>
      <Keyboard from={21} to={108} activeNotes={activeNotes} onNoteOn={noteOn} onNoteOff={noteOff} />
    </main>
  )
}

export default App
