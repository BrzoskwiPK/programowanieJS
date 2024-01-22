const ballCount = Math.ceil(Math.random() * 20)
const ballRadius = 8
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

const drawBall = (x, y) => {
  ctx.beginPath()
  ctx.arc(x, y, ballRadius, 0, angleToRadians(360))
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
    balls.push({
      x: Math.random() * (canvas.width - 2 * ballRadius) + ballRadius,
      y: Math.random() * (canvas.height - 2 * ballRadius) + ballRadius,
      dx: Math.random() - 0.5 * 2, // random speed in x direction
      dy: Math.random() - 0.5 * 2, // random speed in y direction
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

    if (currentBall.x - ballRadius < 0 || currentBall.x + ballRadius > canvas.width)
      currentBall.dx = -currentBall.dx // if collides with horizontal walls, bounce off the wall

    if (currentBall.y - ballRadius < 0 || currentBall.y + ballRadius > canvas.height)
      currentBall.dy = -currentBall.dy // if collides with vertical walls, bounce off the wall

    drawBall(currentBall.x, currentBall.y)

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
