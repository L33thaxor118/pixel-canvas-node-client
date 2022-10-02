import WebSocket from 'ws'
const socket: WebSocket = new WebSocket('wss://282bm5cqa4.execute-api.us-east-1.amazonaws.com/development/')

interface AWSRequest {
  action: string
}

interface PaintCommand extends AWSRequest {
  x: number,
  y: number,
  color: number
}

// Represents canvas state in 2 dimensions
type CanvasState = Array<Array<number>>

type CanvasStateListener = (state: CanvasState) => void

var stateListener: CanvasStateListener | null = null

// Assume canvas is empty until we receive state from server
var currentState: CanvasState = Array(16).fill(0).map(_ => Array(16).fill(0))

socket.on('open', () => {
  const request: AWSRequest = {
    action: "get"
  }
  socket.send(JSON.stringify(request))
})

socket.on('message', (data) => {
  const messageData = JSON.parse(data.toString())
  if (Array.isArray(messageData)) {
    //received a GET message containing entire state
    currentState = messageData
  } else {
    //received a PAINT message containing update
    currentState[messageData.y][messageData.x] = messageData.color
  }
  if (stateListener != null) {
    stateListener(currentState)
  }
})

/**
 * Paints a pixel on the canvas
 * @param x - x position of pixel to paint, assuming x=0,y=0 is top-left corner
 * @param y - y position of pixel to paint, assuming x=0,y=0 is top-left corner
 * @param color - decimal representation of the color to paint
 */
function paintPixel(x: number, y: number, color: number) {
  const message: PaintCommand = {
    action: "paint",
    x: x,
    y: y,
    color: color
  }
  socket.send(JSON.stringify(message))
}

function setStateListener(listener: CanvasStateListener) {
  stateListener = listener
  listener(currentState)
}

export default {
  paintPixel,
  setStateListener
}