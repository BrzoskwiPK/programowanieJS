const ballCount = Math.ceil(Math.random() * 20)
const minDistance = 25
const canvas = document.getElementById('myCanvas')
const ctx = canvas.getContext('2d')
let balls = []
let animationFrame = null

const angleToRadians = angle => {
  return (Math.PI / 180) * angle
}

const resetCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  balls.length = 0
  cancelAnimationFrame(animationFrame)
}

const drawBall = (x, y, size) => {
  ctx.beginPath()
  ctx.arc(x, y, size, 0, angleToRadians(360))
  ctx.strokeStyle = 'black'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.closePath()
}

const drawLineBetweenBalls = (firstBall, secondBall) => {
  ctx.beginPath()
  ctx.moveTo(firstBall.x, firstBall.y)
  ctx.lineTo(secondBall.x, secondBall.y)
  ctx.strokeStyle = 'red'
  ctx.stroke()
  ctx.closePath()
}

const generateBalls = () => {
  balls.length = 0

  for (let i = 0; i < ballCount; i++) {
    const randomSize = Math.ceil(Math.random() * 10) + 5
    balls.push({
      x: Math.random() * (canvas.width - 2 * randomSize) + randomSize,
      y: Math.random() * (canvas.height - 2 * randomSize) + randomSize,
      dx: Math.random() - 0.5 * 2, // random speed in x direction
      dy: Math.random() - 0.5 * 2, // random speed in y direction
      size: randomSize,
    })
  }

  drawCanvas()
}

const drawCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height) // clear the canvas before every frame

  for (let i = 0; i < balls.length; i++) {
    const currentBall = balls[i]

    currentBall.x += currentBall.dx // movement in x direction
    currentBall.y += currentBall.dy // movement in y direction

    if (currentBall.x - currentBall.size < 0 || currentBall.x + currentBall.size > canvas.width)
      currentBall.dx = -currentBall.dx // if collides with horizontal walls, bounce off the wall

    if (currentBall.y - currentBall.size < 0 || currentBall.y + currentBall.size > canvas.height)
      currentBall.dy = -currentBall.dy // if collides with vertical walls, bounce off the wall

    if (currentBall.size < 1) {
      balls.splice(i, 1)
      continue
    }

    drawBall(currentBall.x, currentBall.y, currentBall.size)

    for (let j = i + 1; j < balls.length; j++) {
      const siblingBall = balls[j]

      const distance = Math.sqrt(
        (currentBall.x - siblingBall.x) ** 2 + (currentBall.y - siblingBall.y) ** 2
      )

      if (distance < minDistance) {
        drawLineBetweenBalls(currentBall, siblingBall)
      }
    }
  }

  animationFrame = requestAnimationFrame(drawCanvas)
}

document.getElementById('buttons__reset').addEventListener('click', resetCanvas)
document.getElementById('buttons__start').addEventListener('click', generateBalls)

generateBalls()
