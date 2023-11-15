const notesContainer = document.querySelector('.notes__container')
const newNoteButton = document.querySelector('.notekeeper__new')
const searchInput = document.querySelector('.search__input')
const form = document.querySelector('.notekeeper__form')

const getFormValues = () => {
  return {
    title: document.getElementById('title').value,
    content: document.getElementById('content').value,
    color: document.getElementById('color').value,
    pin: document.getElementById('pin').checked,
    tags: document.getElementById('tags').value,
    reminder: document.getElementById('reminder').value,
    items: document.getElementById('items').value,
  }
}

const getNotes = () => {
  const savedNotes = localStorage.getItem('notes')

  return savedNotes ? JSON.parse(savedNotes) : []
}

const parseTags = tagsString => {
  return tagsString.length ? tagsString.split(/,\s*|\s/).map(tag => `#${tag.trim()}`) : 'NO TAGS'
}

const parseItems = itemsString => {
  return itemsString.length
    ? itemsString.split(/,\s*|\s/).map(item => ({ text: `❌: ${item.trim()}`, done: false }))
    : 'NO ITEMS'
}

const createButton = (textContent, classList, parentNode) => {
  const button = document.createElement('button')
  button.classList.add(classList)
  button.textContent = textContent
  parentNode.appendChild(button)
}

const createButtons = noteElement => {
  createButton('Edit', 'edit-note', noteElement)
  createButton('Delete', 'delete-note', noteElement)
}

const createListIfNotEmpty = (note, noteElement) => {
  if (note.items && note.items.length > 0) {
    const listElement = createListElement(note)
    noteElement.appendChild(listElement)
  }
}

const createNoteElement = (note, index) => {
  const noteElement = document.createElement('div')
  noteElement.className = 'note'
  noteElement.style.backgroundColor = note.color

  noteElement.innerHTML = `
        <h3>${note.title}</h3>
        <p>${note.content}</p>
        <p>${Array.isArray(note.tags) ? note.tags.join(', ') : note.tags}</p>
      `

  createButtons(noteElement)
  createListIfNotEmpty(note, noteElement)

  if (note.pin) noteElement.classList.add('pinned')

  noteElement.setAttribute('data-id', note.id)
  noteElement.setAttribute('data-index', index)

  return noteElement
}

const editNote = noteToEdit => {
  document.querySelector('h4').innerHTML = 'EDIT NOTE'
  document.getElementById('title').value = noteToEdit.title
  document.getElementById('content').value = noteToEdit.content
  document.getElementById('color').value = noteToEdit.color
  document.getElementById('pin').checked = noteToEdit.pin
  document.getElementById('tags').value = Array.isArray(noteToEdit.tags)
    ? noteToEdit.tags.join(', ').replaceAll('#', '')
    : ''
  document.getElementById('reminder').value = noteToEdit.reminder
  document.getElementById('items').value = Array.isArray(noteToEdit.items)
    ? noteToEdit.items.map(item => item.text.replace('❌: ', '').replace('✔', '')).join(', ')
    : ''
  document.querySelector('.notekeeper__new').innerHTML = 'EDIT'

  newNoteButton.removeEventListener('click', addNote)
  newNoteButton.addEventListener('click', () => saveEditedNote(noteToEdit))
}

const saveEditedNote = originalNote => {
  const formValues = getFormValues()

  const updatedNote = {
    id: originalNote.id,
    date: new Date(),
    ...formValues,
    tags: parseTags(formValues.tags),
    items: parseItems(formValues.items),
  }

  const notes = getNotes()
  const index = notes.findIndex(note => note.id === originalNote.id)

  if (index !== -1) {
    notes[index] = updatedNote

    saveNotes(notes)
    loadNotes()
    resetForm()
  }
}

const resetForm = () => {
  document.querySelector('h4').innerHTML = 'NEW NOTE'
  document.getElementById('title').value = ''
  document.getElementById('content').value = ''
  document.getElementById('color').value = '#ffffff'
  document.getElementById('pin').checked = false
  document.getElementById('tags').value = ''
  document.getElementById('reminder').value = ''
  document.getElementById('items').value = ''
  document.querySelector('.notekeeper__new').innerHTML = 'ADD A NOTE'

  newNoteButton.removeEventListener('click', saveEditedNote)
  newNoteButton.removeEventListener('click', addNote)
  newNoteButton.addEventListener('click', e => addNote(e))
}

const deleteNote = note => {
  const notes = getNotes()
  const updatedNotes = notes.filter(existingNote => existingNote.id !== note.id)

  saveNotes(updatedNotes)
  loadNotes()
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

  ;[...pinnedNotes, ...unpinnedNotes].forEach((note, index) => {
    const noteElement = createNoteElement(note, index)

    notesContainer.appendChild(noteElement)

    const editButton = noteElement.querySelector('.edit-note')
    const deleteButton = noteElement.querySelector('.delete-note')

    editButton.addEventListener('click', () => editNote(note))
    deleteButton.addEventListener('click', () => deleteNote(note))
  })
}

document.addEventListener('DOMContentLoaded', e => loadNotes(e))
document.addEventListener('DOMContentLoaded', () => showReminders())

const addNote = e => {
  e.preventDefault()

  const formValues = getFormValues()
  const date = new Date()

  const note = {
    id: Math.random().toString(36).slice(2, 9),
    date,
    ...formValues,
    tags: parseTags(formValues.tags),
    items: parseItems(formValues.items),
  }

  const notes = getNotes()
  notes.push(note)
  saveNotes(notes)
  loadNotes()

  resetForm()
}

const saveNotes = notes => localStorage.setItem('notes', JSON.stringify(notes))

form.addEventListener('submit', e => addNote(e))

const searchNotes = searchTerm => {
  const notes = getNotes()

  const matchingNotes = notes.filter(note => {
    return (
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      note.items.some(item => item.text.toLowerCase().includes(searchTerm))
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

const toggleItemDone = (noteIndex, itemIndex) => {
  const notes = getNotes()
  const currentNote = notes[parseInt(noteIndex)]

  if (currentNote && currentNote.items && currentNote.items[itemIndex]) {
    if (currentNote.items[itemIndex].done) {
      currentNote.items[itemIndex].done = false
      currentNote.items[itemIndex].text = currentNote.items[itemIndex].text.replace('✔', '❌')
    } else {
      currentNote.items[itemIndex].done = true
      currentNote.items[itemIndex].text = currentNote.items[itemIndex].text.replace('❌', '✔')
    }

    saveNotes(notes)
    loadNotes()
  }
}

notesContainer.addEventListener('click', e => {
  if (e.target.classList.contains('item')) {
    const noteId = e.target.closest('.note').getAttribute('data-id')
    const itemIndex = e.target.dataset.index
    const noteIndex = getNotes().findIndex(note => note.id === noteId)

    toggleItemDone(noteIndex, itemIndex)
  }
})

const createListElement = note => {
  const listElement = document.createElement('div')
  listElement.className = 'list'

  Array.isArray(note.items)
    ? note.items.forEach((item, index) => {
        const itemElement = document.createElement('div')
        itemElement.className = `item ${item.done ? 'done' : ''}`
        itemElement.dataset.index = index
        itemElement.textContent = item.text

        listElement.appendChild(itemElement)
      })
    : (listElement.textContent = 'NO ITEMS')

  return listElement
}
