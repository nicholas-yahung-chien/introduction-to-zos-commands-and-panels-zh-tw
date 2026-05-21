export async function getJson(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`)
  }
  return response.json()
}

export async function findDebugPage(predicate, endpoint = 'http://127.0.0.1:9223') {
  const pages = await getJson(`${endpoint}/json/list`)
  const page = pages.find((candidate) => candidate.type === 'page' && predicate(candidate))
  if (!page) {
    throw new Error(`No matching debug page found at ${endpoint}`)
  }
  return page
}

export async function evaluateInPage(page, expression) {
  const socket = new WebSocket(page.webSocketDebuggerUrl)
  let nextId = 1
  const pending = new Map()

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data)
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message)
      pending.delete(message.id)
    }
  }

  await new Promise((resolve, reject) => {
    socket.onopen = resolve
    socket.onerror = reject
  })

  const send = (method, params = {}) => {
    const id = nextId++
    socket.send(JSON.stringify({ id, method, params }))
    return new Promise((resolve) => pending.set(id, resolve))
  }

  await send('Runtime.enable')
  const result = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true
  })
  socket.close()

  if (result.error) {
    throw new Error(result.error.message)
  }
  if (result.result?.exceptionDetails) {
    throw new Error(result.result.exceptionDetails.text)
  }
  return result.result.result.value
}

