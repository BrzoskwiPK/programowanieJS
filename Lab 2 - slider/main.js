const contentHolder = document.querySelector('.contentHolder')
const imageHolders = contentHolder.querySelectorAll('.imageHolder')
const nextButton = document.querySelector('.rightSwitch')
const prevButton = document.querySelector('.leftSwitch')
const pauseButton = document.querySelector('.pause')
const resumeButton = document.querySelector('.resume')
const sliderOptions = document.querySelectorAll('input[name="slider-mode"]')
const sliderMode = document.querySelector('.slider')
const lightBox = document.querySelector('.lightbox')
const lightBoxImage = document.querySelector('.lightbox__image')
const container = document.querySelector('.container')

let fadeMode = false
let intervalId = null
let currentIndex = 0

const imagesCount = imageHolders.length

sliderOptions.forEach(option => {
  option.addEventListener('change', () => {
    if (option.value === 'fade') {
      fadeMode = true
      sliderMode.classList.add('fade-mode')
    } else {
      fadeMode = false
      sliderMode.classList.remove('fade-mode')
    }

    handlePause()
    updateImages()
  })
})

const nextImage = () => {
  currentIndex = (currentIndex + 1) % imagesCount
  updateImages()
}

const updateImages = () => {
  imageHolders.forEach((imageHolder, index) => {
    if (fadeMode) {
      const offset = (index - currentIndex) * 100
      imageHolder.style.transform = `translateX(${offset}%)`

      if (index === currentIndex) imageHolder.style.opacity = 1
      else imageHolder.style.opacity = 0
    } else {
      const offset = (index - currentIndex) * 100
      imageHolder.style.transform = `translateX(${offset}%)`
      imageHolder.style.opacity = 1
    }
  })
}

intervalId = setInterval(nextImage, 2000)

const handlePause = () => clearInterval(intervalId)

const handleResume = () => (intervalId = setInterval(nextImage, 2000))

const goToImage = index => {
  currentIndex = index
  updateImages()
}

const renderLightbox = () => {
  handlePause()

  container.style.opacity = '0.1'
  lightBox.classList.add('active')

  lightBoxImage.src = imageHolders[currentIndex].querySelector('img').src
}

const exitLightbox = () => {
  lightBox.classList.remove('active')
  container.style.opacity = '1'

  handleResume()
}

const assembleImageButtons = () => {
  for (let i = 0; i < imagesCount; i++) {
    const buttonElement = document.createElement('div')
    buttonElement.innerHTML = i + 1
    buttonElement.classList.add('button')
    document.querySelector('.buttons_bottom').appendChild(buttonElement)
    buttonElement.addEventListener('click', () => {
      handlePause()
      goToImage(i)
    })
  }
}

contentHolder.addEventListener('click', renderLightbox)
lightBoxImage.addEventListener('click', exitLightbox)

pauseButton.addEventListener('click', handlePause)
resumeButton.addEventListener('click', e => handleResume(e))

nextButton.addEventListener('click', () => {
  if (currentIndex === imagesCount - 1) currentIndex = 0
  else currentIndex++

  handlePause()
  updateImages()
})

prevButton.addEventListener('click', () => {
  if (currentIndex === 0) currentIndex = imagesCount - 1
  else currentIndex--

  handlePause()
  updateImages()
})

assembleImageButtons()
