import React, { useCallback } from 'react'

export const useEventSender = () => {
  const sendEvent = useCallback((eventName, eventData, originId = 'SIMULATION') => {
    const event = {
      originId,
      name: eventName,
      data: eventData,
      occurredOn: Date.now()
    }

    const targetOrigin = '*' // e.g., 'https://player.example.com'
    window.postMessage(event, targetOrigin)
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(event, targetOrigin)
    }

    // eslint-disable-next-line no-console
    console.log('Event sent:', event)
  }, [])

  return sendEvent
}
