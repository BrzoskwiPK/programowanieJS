// WERSJA SHAME

for (let i = 0; i < 4; i++) {
  const newDiv = document.createElement('input')
  newDiv.setAttribute('class', 'number')
  newDiv.setAttribute('type', 'number')
  document.body.appendChild(newDiv)
}

const buttonNode = document.createElement('button')
buttonNode.textContent = 'Przelicz'
buttonNode.setAttribute('id', 'submitButton')

document.body.appendChild(buttonNode)

const handleLogic = () => {
  const inputs = document.querySelectorAll('.number')

  const values = [...inputs]
    .filter(element => !isNaN(element.value) && element.value !== '')
    .map(element => parseInt(element.value))
    .sort((a, b) => a - b)

  const sumOfNumbers = values.length
    ? values.reduce((prev, curr) => prev + curr)
    : 0

  const average = values.length
    ? sumOfNumbers / values.length
    : 'Can not calculate'

  const minimum = values.length ? values[0] : 'Can not calculate'
  const maximum = values.length
    ? values[values.length - 1]
    : 'Can not calculate'

  document.querySelector('#scores').innerHTML =
    'Sum of numbers: ' +
    sumOfNumbers +
    '<br>Average: ' +
    average +
    '<br>Maximum: ' +
    maximum +
    '<br>Minimum: ' +
    minimum
}

document.querySelector('#submitButton').addEventListener('click', handleLogic)

// WERSJA ZIEEW

let inputHandlers = document.querySelectorAll('.number')

Array.from(inputHandlers).forEach(input => {
  input.addEventListener('change', handleLogic)
})

// WERSJA NORMAL

document.body.removeChild(document.querySelectorAll('.number')[3])

document.querySelector('#addInput').addEventListener('click', () => {
  const newDiv = document.createElement('input')
  newDiv.setAttribute('class', 'number')
  newDiv.setAttribute('type', 'number')
  document.body.insertBefore(newDiv, document.querySelector('#submitButton'))
})

const buttonNodeExtended = document.createElement('button')
buttonNodeExtended.textContent = 'Przelicz (extended)'
buttonNodeExtended.setAttribute('id', 'submitButtonExtended')

document.body.appendChild(buttonNodeExtended)

const extendedHandleLogic = () => {
  const inputs = document.querySelectorAll('.number')

  inputs.forEach(input => {
    if (input.value === '' || isNaN(input.value))
      document.body.removeChild(input)
  })

  const values = [...inputs]
    .filter(element => !isNaN(element.value) && element.value !== '')
    .map(element => parseInt(element.value))
    .sort((a, b) => a - b)

  const sumOfNumbers = values.length
    ? values.reduce((prev, curr) => prev + curr)
    : 0

  const average = values.length
    ? sumOfNumbers / values.length
    : 'Can not calculate'

  const minimum = values.length ? values[0] : 'Can not calculate'
  const maximum = values.length
    ? values[values.length - 1]
    : 'Can not calculate'

  document.querySelector('#scores').innerHTML =
    'Sum of numbers: ' +
    sumOfNumbers +
    '<br>Average: ' +
    average +
    '<br>Maximum: ' +
    maximum +
    '<br>Minimum: ' +
    minimum
}

document
  .querySelector('#submitButtonExtended')
  .addEventListener('click', extendedHandleLogic)
