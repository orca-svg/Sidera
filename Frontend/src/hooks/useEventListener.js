import { useEffect, useRef } from 'react'

/**
 * Custom hook for attaching event listeners with automatic cleanup
 * Prevents memory leaks and deduplicates event listener logic
 *
 * @param {string} eventName - The name of the event (e.g., 'mousemove', 'resize', 'keydown')
 * @param {Function} handler - The event handler function
 * @param {Element|Window} element - The target element (defaults to window)
 * @param {Object} options - Optional event listener options (e.g., { passive: true })
 */
export function useEventListener(eventName, handler, element = window, options = {}) {
    // Store handler in ref to avoid re-attaching listener on every render
    const savedHandler = useRef()

    // Update ref when handler changes
    useEffect(() => {
        savedHandler.current = handler
    }, [handler])

    useEffect(() => {
        // Check if element supports addEventListener
        const isSupported = element && element.addEventListener
        if (!isSupported) return

        // Create event listener that calls current handler
        const eventListener = (event) => savedHandler.current?.(event)

        // Add event listener
        element.addEventListener(eventName, eventListener, options)

        // Cleanup function removes event listener
        return () => {
            element.removeEventListener(eventName, eventListener, options)
        }
    }, [eventName, element, options]) // Re-run when event name or element changes
}
