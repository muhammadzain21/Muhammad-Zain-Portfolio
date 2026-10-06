export function navigateToSection(sectionId: string) {
  const isHomePage = window.location.pathname === '/'

  if (isHomePage) {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.history.pushState(null, '', `#${sectionId}`)
    }
  } else {
    window.location.href = `/#${sectionId}`
  }
}
