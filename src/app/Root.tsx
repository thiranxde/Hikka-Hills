import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

/**
 * Scrolls to the section named in the address ("/#gallery") on every navigation, including a click on the link of
 * the section already in the address, and to the top on a page without one.
 */
export function Root() {
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    const id = decodeURIComponent(hash.replace(/^#/, ''))
    if (!id) {
      window.scrollTo({ top: 0 })
      return
    }
    // Wait a frame so a page that has just rendered has its sections in place.
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(id)
      if (!target) return
      target.scrollIntoView({ block: 'start' })
      // Hand keyboard focus to the section, so Tab continues from there.
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash, key])

  return <Outlet />
}
