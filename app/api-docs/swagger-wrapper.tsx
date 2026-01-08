'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

// Define props type based on SwaggerUI component props
type SwaggerUIWrapperProps = Readonly<ComponentProps<typeof SwaggerUI>>

// Wrapper component to suppress React strict mode warnings from swagger-ui-react
export function SwaggerUIWrapper(props: SwaggerUIWrapperProps) {
  const originalWarnRef = useRef<typeof console.warn | null>(null)

  useEffect(() => {
    // Store the original console.warn
    originalWarnRef.current = console.warn

    // Override console.warn to filter out the specific warnings
    console.warn = (...args: unknown[]) => {
      const message = typeof args[0] === 'string' ? args[0] : String(args[0])

      // Suppress warnings about UNSAFE_componentWillReceiveProps from swagger-ui-react components
      if (
        message.includes('UNSAFE_componentWillReceiveProps') &&
        (message.includes('ModelCollapse') || message.includes('RequestBodyEditor'))
      ) {
        // Suppress this warning
        return
      }

      // Allow all other warnings
      if (originalWarnRef.current) {
        originalWarnRef.current(...args)
      }
    }

    // Cleanup: restore original console.warn
    return () => {
      if (originalWarnRef.current) {
        console.warn = originalWarnRef.current
      }
    }
  }, [])

  return <SwaggerUI {...props} />
}
