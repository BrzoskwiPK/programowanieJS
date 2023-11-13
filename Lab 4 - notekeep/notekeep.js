const notesContainer = document.querySelector('.notes__container')
const newNoteButton = document.querySelector('.notekeeper__new')
const searchInput = document.querySelector('.search__input')

const getNotes = () => {
  const savedNotes = localStorage.getItem('notes')

  return savedNotes ? JSON.parse(savedNotes) : []
}

const parseTags = tagsString => {
  return tagsString.split(/,|, | /).map(tag => `#${tag.trim()}`)
}

const parseItems = itemsString => {
  return itemsString.split(/,|, | /).map(item => ({ text: `❌: ${item.trim()}`, done: false }))
}

const createNoteElement = note => {
  const noteElement = document.createElement('div')
  noteElement.className = 'note'
  noteElement.style.backgroundColor = note.color

  noteElement.innerHTML = `
        <h3>${note.title}</h3>
        <p>${note.content}</p>
        <p>${note.tags.join(', ')}</p>
      `

  if (note.items && note.items.length > 0) {
    const listElement = createListElement(note)
    noteElement.appendChild(listElement)
  }

  if (note.pin) noteElement.classList.add('pinned')

  return noteElement
}

const loadNotes = () => {
  notesContainer.innerHTML = ''

  const notes = getNotes()

  const pinnedNotes = notes
    .filter(note => note.pin)
    .sort((first, second) => new Date(second.date) - new Date(first.date))

  const unpinnedNotes = notes
    .filter(note => !note.pin)
    .sort((first, second) => new Date(second.date) - new Date(first.date))

  ;[...pinnedNotes, ...unpinnedNotes].forEach(note => {
    const noteElement = createNoteElement(note)

    notesContainer.appendChild(noteElement)
  })
}

document.addEventListener('DOMContentLoaded', e => loadNotes(e))
document.addEventListener('DOMContentLoaded', () => showReminders())

const addNote = e => {
  e.preventDefault()
  const title = document.getElementById('title').value
  const content = document.getElementById('content').value
  const color = document.getElementById('color').value
  const pin = document.getElementById('pin').checked
  const tags = document.getElementById('tags').value
  const reminder = document.getElementById('reminder').value
  const items = document.getElementById('items').value
  const date = new Date()

  const note = {
    title,
    content,
    color,
    pin,
    date,
    tags: parseTags(tags),
    reminder: reminder,
    items: parseItems(items),
  }

  const notes = getNotes()
  notes.push(note)
  saveNotes(notes)
  loadNotes()

  document.getElementById('title').value = ''
  document.getElementById('content').value = ''
  document.getElementById('color').value = '#ffffff'
  document.getElementById('pin').checked = false
  document.getElementById('tags').value = ''
  document.getElementById('items').value = ''
}

const saveNotes = notes => localStorage.setItem('notes', JSON.stringify(notes))

newNoteButton.addEventListener('click', e => addNote(e))

const searchNotes = searchTerm => {
  const notes = getNotes()

  const matchingNotes = notes.filter(note => {
    return (
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  })

  return matchingNotes
}

const updateSearchResults = searchTerm => {
  const searchResults = searchNotes(searchTerm)
  notesContainer.innerHTML = ''

  searchResults.forEach(note => {
    const noteElement = createNoteElement(note)
    notesContainer.appendChild(noteElement)
  })
}

searchInput.addEventListener('input', e => {
  const searchTerm = e.target.value.toLowerCase()
  updateSearchResults(searchTerm)
})

const showReminders = () => {
  const currentDateTime = new Date()
  const notes = getNotes()

  const upcomingReminders = notes.filter(note => {
    if (note.reminder) {
      const reminderDateTime = new Date(note.reminder)

      return reminderDateTime < currentDateTime
    }
    return false
  })

  upcomingReminders.forEach(note => {
    alert(`Reminder: ${note.title} - ${note.reminder}`)
  })
}

const toggleItemDone = index => {
  const notes = getNotes()
  const currentNote = notes[notes.length - 1]

  if (currentNote.items[index].done) {
    currentNote.items[index].done = false
    currentNote.items[index].text = currentNote.items[index].text.replace('✔', '❌')
  } else {
    currentNote.items[index].done = true
    currentNote.items[index].text = currentNote.items[index].text.replace('❌', '✔')
  }

  saveNotes(notes)
  loadNotes()
}

notesContainer.addEventListener('click', e => {
  if (e.target.classList.contains('item')) {
    const index = e.target.dataset.index
    toggleItemDone(index)
  }
})

const createListElement = note => {
  const listElement = document.createElement('div')
  listElement.className = 'list'

  note.items.forEach((item, index) => {
    const itemElement = document.createElement('div')
    itemElement.className = `item ${item.done ? 'done' : ''}`
    itemElement.dataset.index = index
    itemElement.textContent = item.text

    listElement.appendChild(itemElement)
  })

  return listElement
}
