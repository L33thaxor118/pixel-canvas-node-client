import WebSocket from 'ws'

interface PaintCommand {
  x: number,
  y: number,
  color: number
}

interface AWSRequest {
  action: string
}

/**
 * Represents canvas state in 2 dimensions
 */
type MatrixState = Array<Array<number>>

const socket: WebSocket = new WebSocket('wss://282bm5cqa4.execute-api.us-east-1.amazonaws.com/development/')

type MatrixStateListener = (event: MatrixState)=>void

var stateListener: MatrixStateListener | null = null

var currentState: MatrixState

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

socket.on('open', () => {
  const request: AWSRequest = {
    action: "get"
  }
  socket.send(JSON.stringify(request))
})

/**
 * Paints a pixel on the matrix
 * @param x - x position of pixel to paint, assuming x=0,y=0 is top-left corner
 * @param y - y position of pixel to paint, assuming x=0,y=0 is top-left corner
 * @param color - decimal representation of the color to paint
 */
function paintTile(x: number, y: number, color: number) {
  const message: PaintCommand = {
    x: x,
    y: y,
    color: color
  }
  socket.send(JSON.stringify(message))
}

function setStateListener(listener: MatrixStateListener) {
  stateListener = listener
}

export default {
  paintTile,
  setStateListener
}