export function IconGear({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.2" stroke={color} strokeWidth="1.3"/>
      <path d="M8 1.5v1.2M8 13.3v1.2M1.5 8h1.2M13.3 8h1.2M3.4 3.4l.85.85M11.75 11.75l.85.85M3.4 12.6l.85-.85M11.75 4.25l.85-.85"
        stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconBook({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3 2.5h7a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z"
        stroke={color} strokeWidth="1.3"/>
      <path d="M5 5.5h4M5 8h4M5 10.5h2.5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconPencil({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5Z"
        stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconBulb({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 2a4 4 0 0 1 2 7.46V11H6V9.46A4 4 0 0 1 8 2Z"
        stroke={color} strokeWidth="1.3"/>
      <path d="M6 12.5h4M6.5 14h3" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconPeople({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2" stroke={color} strokeWidth="1.3"/>
      <path d="M2 13c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="11" cy="5" r="1.5" stroke={color} strokeWidth="1.3"/>
      <path d="M13.5 13c0-1.66-1.12-3-2.5-3" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconRocket({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 2C8 2 4 5 4 9l3 3c4 0 7-4 7-4L8 2Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M4 9l-1.5 1.5L5 12" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9" cy="7" r="1" fill={color}/>
    </svg>
  )
}

export function IconBuilding({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="8" height="11" rx="1" stroke={color} strokeWidth="1.3"/>
      <rect x="10" y="7" width="4" height="7" rx="1" stroke={color} strokeWidth="1.3"/>
      <path d="M5 6h2M5 9h2M5 12h2" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconMail({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke={color} strokeWidth="1.3"/>
      <path d="M1.5 5l6.5 4.5L14.5 5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconChart({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 12l4-4 3 3 5-6" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconBolt({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M9.5 2L5 9h4.5L6.5 14l6.5-8H8.5L9.5 2Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconShield({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 2L3 4v4c0 3 2.5 5.5 5 6 2.5-.5 5-3 5-6V4L8 2Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconHeart({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 13S2 9 2 5.5a3.5 3.5 0 0 1 6-2.45A3.5 3.5 0 0 1 14 5.5C14 9 8 13 8 13Z"
        stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconCode({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M5 4L1.5 8 5 12M11 4l3.5 4L11 12" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.5 3l-3 10" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconBrain({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 3C5.8 3 4 4.8 4 7c0 1.1.45 2.1 1.17 2.83L5 13h6l-.17-3.17A4 4 0 0 0 8 3Z"
        stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M6 7h4M7 9.5h2" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconAccessibility({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="3" r="1.3" stroke={color} strokeWidth="1.3"/>
      <path d="M8 5.5v4.5M5 14l1.5-3.5 1.5 1 1.5-1L11 14"
        stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4.5 7.5h7" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconRobot({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="3" y="6" width="10" height="7" rx="1.5" stroke={color} strokeWidth="1.3"/>
      <circle cx="6" cy="9.5" r="1" fill={color}/>
      <circle cx="10" cy="9.5" r="1" fill={color}/>
      <path d="M8 2v3.5M6 13v1.5M10 13v1.5M1.5 9h1.5M13 9h1.5"
        stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M6.5 11.5h3" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconDemo({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="2.5" width="13" height="9" rx="1.5" stroke={color} strokeWidth="1.3"/>
      <path d="M5 13.5h6M8 11.5v2" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M6.5 6l3 1.5-3 1.5V6Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  )
}