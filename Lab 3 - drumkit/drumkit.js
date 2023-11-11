const KeyToSound = {
  a: { description: 'CLAP', sound: document.querySelector('#s1') },
  A: { description: 'CLAP', sound: document.querySelector('#s1') },
  s: { description: 'HIHAT', sound: document.querySelector('#s2') },
  S: { description: 'HIHAT', sound: document.querySelector('#s2') },
  d: { description: 'BOOM', sound: document.querySelector('#s3') },
  D: { description: 'BOOM', sound: document.querySelector('#s3') },
  f: { description: 'KICK', sound: document.querySelector('#s4') },
  F: { description: 'KICK', sound: document.querySelector('#s4') },
  g: { description: 'OPENHAT', sound: document.querySelector('#s5') },
  G: { description: 'OPENHAT', sound: document.querySelector('#s5') },
  h: { description: 'RIDE', sound: document.querySelector('#s6') },
  H: { description: 'RIDE', sound: document.querySelector('#s6') },
  j: { description: 'SNARE', sound: document.querySelector('#s7') },
  J: { description: 'SNARE', sound: document.querySelector('#s7') },
  k: { description: 'TINK', sound: document.querySelector('#s8') },
  K: { description: 'TINK', sound: document.querySelector('#s8') },
  l: { description: 'TOM', sound: document.querySelector('#s9') },
  L: { description: 'TOM', sound: document.querySelector('#s9') },
}

const allowedKeys = [
  'a',
  'A',
  's',
  'S',
  'd',
  'D',
  'f',
  'F',
  'g',
  'G',
  'h',
  'H',
  'j',
  'J',
  'k',
  'K',
  'l',
  'L',
]

let isLooped = false
let isMetronomeUsed = false

const soundsPerRow = 5
const maxTracksCount = 5
const minTracksCount = 1
const recordedTracks = []
const trackContainerMaxChildren = 7

const tracksCount = document.querySelector('#tracksCount')
const soundtracksSection = document.querySelector('#soundtracks')
const generateButton = document.querySelector('#generate__button')
const metronomeToggle = document.querySelector('#metronomeCheckbox')
const bpmDisplay = document.querySelector('#bpmDisplay')

metronomeToggle.addEventListener('click', e => handleMetronomeToggle(e))

const handleMetronomeToggle = e => {
  if (e.target.checked) {
    isMetronomeUsed = true
  } else {
    isMetronomeUsed = false
    bpmDisplay.innerHTML = 'BPM: 0'
  }
}

const deleteNodeChildren = element => {
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}

const createButton = (text, className, clickHandler) => {
  const button = document.createElement('button')

  button.classList.add(className)
  button.innerHTML = text
  button.onclick = clickHandler

  return button
}

const deleteTrack = (e, index, parentNode) => {
  e.preventDefault()

  parentNode.remove()

  if (index >= 0 && index < recordedTracks.length) {
    recordedTracks.splice(index, 1)
  }

  if (document.querySelector('#soundtracks').childNodes.length === 2) {
    document.querySelector('.play__all').remove()
    document.querySelector('.add__track').remove()
    document.querySelector('.loop__tracks').remove()
  }

  updatePlayAllButton()
  updateAddAnotherTrackButton()
}

const addTrack = index => {
  const row = document.createElement('div')

  row.classList.add('track', `track${index + 1}`, 'flexCenterRow')
  row.appendChild(createButton('🔴', 'record__button', e => recordTrack(e, index)))
  row.appendChild(createButton('▶️', 'play__button', e => playTrack(e, index)))
  row.appendChild(createButton('❌', 'delete__button', e => deleteTrack(e, index, row)))

  return row
}

const addAnotherTrack = (soundtracksSection, index) => {
  if (index >= 0 && index <= 5) {
    const lastTrack = soundtracksSection.querySelector(`.track${index - 1}.flexCenterRow`)
    const trackRows = soundtracksSection.querySelectorAll('.track')
    const lastRow = trackRows[trackRows.length - 1]

    if (lastTrack) {
      const newRow = lastTrack.cloneNode(true)
      newRow.classList.replace(`track${index - 1}`, `track${index}`)

      newRow
        .querySelector('.record__button')
        .addEventListener('click', e => recordTrack(e, index - 1))
      newRow.querySelector('.play__button').addEventListener('click', e => playTrack(e, index - 1))
      newRow
        .querySelector('.delete__button')
        .addEventListener('click', e => deleteTrack(e, index, newRow))

      soundtracksSection.insertBefore(newRow, lastRow.nextSibling)

      if (index === trackContainerMaxChildren - 1) {
        document.querySelector('.add__track').classList.add('disabled')
      }
    }
  }
  updateAddAnotherTrackButton()
}

const playAllTracks = e => {
  recordedTracks.forEach((_, id) => playTrack(e, id))

  const BPM = Math.round(recordedTracks.length * ((60 * 1000) / 500))
  bpmDisplay.innerHTML = 'BPM: ' + BPM
}

const renderRows = amount => {
  deleteNodeChildren(soundtracksSection)

  const arrayOfRows = []

  const playAllButton = createButton('PLAY ALL TRACKS', 'play__all', e => playAllTracks(e))
  const loopTracksButton = createButton('LOOP TRACKS', 'loop__tracks', e => changeLooper(e))

  const buttonWrapper = document.createElement('div')
  buttonWrapper.classList.add('flexCenterRow')

  soundtracksSection.appendChild(buttonWrapper)
  buttonWrapper.appendChild(playAllButton)
  buttonWrapper.appendChild(loopTracksButton)

  for (let i = 0; i < amount; i++) {
    const row = addTrack(i)

    for (let j = 0; j < soundsPerRow; j++) {
      const sound = document.createElement('div')
      sound.classList.add('sound', `sound${j + 1}`, 'flexCenterRow')

      row.appendChild(sound)
    }

    arrayOfRows.push(row)
  }

  arrayOfRows.forEach(row => soundtracksSection.appendChild(row))

  const addTrackButton = createButton('ADD ANOTHER TRACK', 'add__track', () =>
    addAnotherTrack(soundtracksSection, soundtracksSection.children.length - 1)
  )

  if (arrayOfRows.length === 5) {
    addTrackButton.classList.add('disabled')
  }

  soundtracksSection.appendChild(addTrackButton)
}

const changeLooper = e => {
  e.preventDefault()
  const looperButton = document.querySelector('.loop__tracks')

  if (isLooped) {
    isLooped = false
    looperButton.style.backgroundColor = 'red'
  } else {
    isLooped = true
    looperButton.style.backgroundColor = 'green'
  }
}

const setSoundTracks = () => {
  const tracksCountValue = parseInt(tracksCount.value)

  if (
    isNaN(tracksCountValue) ||
    tracksCountValue < minTracksCount ||
    tracksCountValue > maxTracksCount
  ) {
    alert(`Please choose valid track number to play! [${minTracksCount}-${maxTracksCount}]`)
  } else {
    renderRows(tracksCountValue)
    updatePlayAllButton()
  }
}

const updatePlayAllButton = () => {
  const hasRecordedSounds = recordedTracks.some(track => track.length > 0)
  const playAllButton = document.querySelector('.play__all')

  if (playAllButton) {
    if (hasRecordedSounds) {
      playAllButton.classList.remove('disabled')
    } else {
      playAllButton.classList.add('disabled')
    }
  }
}

const updateAddAnotherTrackButton = () => {
  const soundtracksSection = document.querySelector('#soundtracks')
  const addTrackButton = document.querySelector('.add__track')

  if (addTrackButton) {
    if (soundtracksSection.childNodes.length === trackContainerMaxChildren) {
      addTrackButton.classList.add('disabled')
    } else {
      addTrackButton.classList.remove('disabled')
    }
  }
}

const recordTrack = async (e, index) => {
  e.preventDefault()

  const trackRow = soundtracksSection.querySelector(`.track.track${index + 1}.flexCenterRow`)
  const recordedSounds = []

  for (let i = 0; i < soundsPerRow; i++) {
    const currentBit = trackRow.querySelector(`.sound.sound${i + 1}.flexCenterRow`)
    currentBit.classList.add('active')

    const keyPressPromise = new Promise(resolve => {
      const handleKeyDown = event => {
        event.preventDefault()
        if (allowedKeys.includes(event.key)) {
          resolve(event.key)
          document.removeEventListener('keydown', handleKeyDown)
        }
      }

      document.addEventListener('keydown', handleKeyDown)
    })

    const key = await keyPressPromise
    currentBit.classList.remove('active')

    const sound = KeyToSound[key]

    if (sound) {
      sound.sound.currentTime = 0
      sound.sound.play()
      recordedSounds.push({ key, sound: sound.description })
      currentBit.textContent = sound.description
    }
  }

  recordedTracks[index] = recordedSounds
  updatePlayAllButton()
}

const playTrack = async (e, index) => {
  e.preventDefault()

  let stopPlayback = false

  for (let i = 0; i < soundsPerRow; i++) {
    for (const bit of recordedTracks[index]) {
      if (!isLooped && i > 0) {
        stopPlayback = true
        break
      }

      const sound = KeyToSound[bit.key].sound

      sound.currentTime = 0
      sound.play()

      await new Promise(resolve => setTimeout(resolve, 500))
    }

    if (stopPlayback) {
      break
    }
  }
}

generateButton.addEventListener('click', setSoundTracks)
