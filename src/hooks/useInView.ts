import { useEffect, useState, type RefObject } from 'react'

interface Options {
  /** Keep reporting true once the element has been seen (for entrance animations). */
  once?: boolean
  rootMargin?: string
  threshold?: number
}

/** Whether the element is on screen. Without IntersectionObserver it reports true. */
export function useInView(ref: RefObject<Element | null>, { once = false, rootMargin = '0px', threshold = 0 }: Options = {}) {
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin, threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, once, rootMargin, threshold])

  return inView
}
