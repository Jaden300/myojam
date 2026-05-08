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

export function IconGraduate({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 3L2 6l6 3 6-3-6-3Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M5 7.5V11c0 1.1 1.34 2 3 2s3-.9 3-2V7.5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M14 6v3.5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="14" cy="10" r="0.8" fill={color}/>
    </svg>
  )
}

export function IconPuzzle({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 6h2.5c0-1.1.9-1.5.9-1.5S5.5 3 6.5 3H10a1 1 0 0 1 1 1v3.5c1.1 0 1.5.9 1.5.9S13 9 13 10v2.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V10c-1.1 0-1.5-.9-1.5-.9S3 8.5 3 7.5V7a1 1 0 0 0-1-1Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconMicroscope({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="6" y="1.5" width="3" height="5" rx="0.8" stroke={color} strokeWidth="1.3"/>
      <path d="M7.5 6.5v3" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M5.5 9.5h5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M3 13.5h10" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M7.5 9.5v4" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="7.5" cy="3.8" r="0.7" fill={color}/>
    </svg>
  )
}

export function IconLaptop({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="2.5" width="11" height="8" rx="1" stroke={color} strokeWidth="1.3"/>
      <path d="M1 12.5h14" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M6 12.5l.5 1h3l.5-1" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconHandshake({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M1 9l3-3h2l2 2h2l3-3" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1 9l2 2 2-1 2 1 2-1 2 1 2-2" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 8l2 2M7 8l2 2M9 8l2 2" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

export function IconMedical({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export function IconRefresh({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M13.5 8a5.5 5.5 0 1 1-1.1-3.3" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M12 2.5l.4 2.7 2.6-.4" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconGlobe({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.3"/>
      <ellipse cx="8" cy="8" rx="2.5" ry="6" stroke={color} strokeWidth="1.3"/>
      <path d="M2.5 5.5h11M2.5 10.5h11" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconMapleLeaf({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5L6.5 4l-3-.5L5 6l-3 2h3l-1 2h2.5L8 14.5l1.5-4.5H12l-1-2h3l-3-2 1.5-2.5-3 .5L8 1.5Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconCoffee({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3 6h8l-1 6H4L3 6Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M11 7.5h1.5a1.5 1.5 0 0 1 0 3H11" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M6 4.5c0 0-.5-1 0-2M8.5 4.5c0 0-.5-1 0-2" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

export function IconChess({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="4" r="2" stroke={color} strokeWidth="1.3"/>
      <path d="M6 6l-.5 2h5L10 6" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M5.5 8l-.5 4h6l-.5-4" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M4 13.5h8" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconWave({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M6 2.5C6 2 6.5 1.5 7 1.5s1 .5 1 1v5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M8 3C8 2.5 8.5 2 9 2s1 .5 1 1v4.5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M4 4.5C4 4 4.5 3.5 5 3.5S6 4 6 4.5v4" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M10 4C10 3.5 10.5 3 11 3s1 .5 1 1v3" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M4 8.5C4 10.5 5 12.5 8 13.5c3-1 4-3 4-5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconFire({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 14c-3 0-5-2-5-5 0-2.5 1.5-4 2-5.5.5 1 1.5 2 1.5 2C7 4 7.5 2 8.5 1c.5 2 2 3.5 2 5 0 1-.5 1.5-.5 1.5C11.5 8 12 9 12 10.5c0 .7-.2 1.3-.5 1.8C11 13.5 9.6 14 8 14Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M8 14c-1.5 0-2.5-1-2.5-2.5 0-1 .5-1.5 1-2 .2.8.8 1.5 1.5 1.5s1.3-.7 1.5-1.5c.5.5 1 1 1 2C10.5 13 9.5 14 8 14Z" stroke={color} strokeWidth="1.1" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconBarChart({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 13.5h12" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <rect x="3" y="8" width="2.5" height="5.5" rx="0.5" stroke={color} strokeWidth="1.3"/>
      <rect x="6.75" y="5" width="2.5" height="8.5" rx="0.5" stroke={color} strokeWidth="1.3"/>
      <rect x="10.5" y="3" width="2.5" height="10.5" rx="0.5" stroke={color} strokeWidth="1.3"/>
    </svg>
  )
}

export function IconWrench({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M10.5 2C8.6 2 7 3.6 7 5.5c0 .5.1 1 .3 1.4L2.5 11.5a1.5 1.5 0 0 0 2.1 2.1L9.2 8.8c.4.2.9.3 1.4.3C12.4 9.1 14 7.5 14 5.6c0-.5-.1-1-.3-1.4l-2.1 2.1-1.4-1.4 2.1-2.1c-.5-.2-1-.3-1.8-.8Z" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconDocument({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M4 2h6l3 3v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M10 2v3h3" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M5.5 8h5M5.5 10.5h5M5.5 5.5h3" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconAntenna({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 8v5.5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M5 10.5h6" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M5.5 7C6 5.5 7 4.5 8 4.5S10 5.5 10.5 7" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M3 5.5C4 3 6 1.5 8 1.5S12 3 13 5.5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="8" cy="8" r="1.2" stroke={color} strokeWidth="1.2"/>
    </svg>
  )
}

export function IconChat({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H5l-3 2V3Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M5 6h6M5 8.5h4" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconClock({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.3"/>
      <path d="M8 5v3l2 1.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconMegaphone({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 6v4h2L11 13V3L4 6H2Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M4 6v4" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M13 5c.8.8 1.2 1.8 1.2 3s-.4 2.2-1.2 3" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconBellOff({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M5 5.5A3 3 0 0 1 11 8v3H4V8c0-.5.1-1 .3-1.4" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.5 12.5a1.5 1.5 0 0 0 3 0" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M2 2l12 12" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconPhoneOff({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3.5 3.5C5 2 6.5 2 7.5 3L9 4.5 7.5 6 9.5 8l1.5-1.5L12.5 8c1 1 1 2.5-.5 4" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 2l12 12" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconSprout({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 14V7" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M8 10c0 0-4-1-4-5 0 0 4 0 4 5Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M8 8c0 0 3-1 3-4 0 0-3 0-3 4Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconLink({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5L7 4" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5L9 12" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconNote({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="2" width="11" height="12" rx="1" stroke={color} strokeWidth="1.3"/>
      <path d="M5 5.5h6M5 8h6M5 10.5h3.5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconEye({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M1.5 8C3 5 5.5 3.5 8 3.5S13 5 14.5 8C13 11 10.5 12.5 8 12.5S3 11 1.5 8Z" stroke={color} strokeWidth="1.3"/>
      <circle cx="8" cy="8" r="2" stroke={color} strokeWidth="1.3"/>
    </svg>
  )
}

/* ── Gesture icons (used in GestureGame, 24×24 viewbox scales cleanly) ── */

export function IconGestureIndex({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="14" width="6" height="7" rx="3" stroke={color} strokeWidth="1.5"/>
      <path d="M9 17V8a3 3 0 0 1 6 0v9" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 13c-1.5 0-3 1-3 3v1a3 3 0 0 0 3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15 13c1.5 0 3 1 3 3v1a3 3 0 0 1-3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 12c-1.5 0-2.5.8-2.5 2" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M15 12c1.5 0 2.5.8 2.5 2" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

export function IconGestureMiddle({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9.5 18V9a2.5 2.5 0 0 1 5 0v9" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 18V11a2.5 2.5 0 0 1 2.5-2.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M17 18V11a2.5 2.5 0 0 0-2.5-2.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 18h10a0 0 0 0 1 0 0v.5A2.5 2.5 0 0 1 14.5 21h-5A2.5 2.5 0 0 1 7 18.5V18Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M7 14.5c-1.2 0-2 .8-2 2V18" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M17 14.5c1.2 0 2 .8 2 2V18" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

export function IconGestureRing({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 18V9a2.5 2.5 0 0 1 5 0v2.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 18V13a2.5 2.5 0 0 1 5 0v5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M17 11.5V18" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 18h10v.5A2.5 2.5 0 0 1 14.5 21h-5A2.5 2.5 0 0 1 7 18.5V18Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M5 16c-1 0-2 .8-2 2v.5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M19 16c1 0 2 .8 2 2v.5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

export function IconGesturePinky({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 11v7" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 9a2.5 2.5 0 0 1 5 0v9" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 14a2.5 2.5 0 0 1 5 0v4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15 16a2.5 2.5 0 0 1 5 0v2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 18h15v.5A2.5 2.5 0 0 1 17.5 21h-10A2.5 2.5 0 0 1 5 18.5V18Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M3 13c-1 0-1.5.7-1.5 1.5V18" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

export function IconGestureThumb({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9 12V7.5A2.5 2.5 0 0 1 14 7l1 5H9Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9 12H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-6Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconGestureFist({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="5" y="10" width="14" height="11" rx="3" stroke={color} strokeWidth="1.5"/>
      <path d="M8 10V7.5a2 2 0 0 1 4 0V10" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 10V8a2 2 0 0 1 4 0v2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 14h14" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M8 14v7M12 14v7" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

export function IconDatabase({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <ellipse cx="8" cy="4.5" rx="5" ry="2" stroke={color} strokeWidth="1.3"/>
      <path d="M3 4.5v7c0 1.1 2.24 2 5 2s5-.9 5-2v-7" stroke={color} strokeWidth="1.3"/>
      <path d="M3 8c0 1.1 2.24 2 5 2s5-.9 5-2" stroke={color} strokeWidth="1.3"/>
    </svg>
  )
}

export function IconMap({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M1.5 4L5.5 2.5l5 2L14.5 3v9.5L10.5 14l-5-2-4 1V4Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M5.5 2.5v9M10.5 4.5v9" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconTarget({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.3"/>
      <circle cx="8" cy="8" r="3" stroke={color} strokeWidth="1.3"/>
      <circle cx="8" cy="8" r="1.2" fill={color}/>
    </svg>
  )
}

export function IconGame({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="5" width="13" height="7.5" rx="3" stroke={color} strokeWidth="1.3"/>
      <path d="M5 8.8H7M6 7.8v2" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="10.5" cy="8.2" r="0.8" fill={color}/>
      <circle cx="12" cy="9.4" r="0.8" fill={color}/>
    </svg>
  )
}

export function IconSparkle({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5L9.2 6.8L14.5 8L9.2 9.2L8 14.5L6.8 9.2L1.5 8L6.8 6.8L8 1.5Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconPlug({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M6 2v4.5M10 2v4.5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M4 6.5h8v1.8a4 4 0 0 1-8 0V6.5Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M8 10.5v3" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconAlert({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 2L1.5 13.5h13L8 2Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M8 7v3" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="8" cy="11.2" r="0.7" fill={color}/>
    </svg>
  )
}

export function IconLoop({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M11.5 4A5 5 0 1 0 13.2 8" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M13.2 4.5v3.5H9.8" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconArm({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3 12.5l3-3h3V7h4a1 1 0 0 0 0-2H9V3H6L3 6v6.5Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M9 9.5v3M7 9.5v3" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M6.5 12.5h3" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconLineChart({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 13.5h12" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M2 11l3-4 3 2 3-5 3 2.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconClipboard({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M6 2.5h4M5 2.5H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-10a1 1 0 0 0-1-1h-1" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <rect x="6" y="1.5" width="4" height="2.5" rx="1" stroke={color} strokeWidth="1.3"/>
      <path d="M5.5 7h5M5.5 9.5h5M5.5 12h3" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconMuscle({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3 10.5c0-3 1.5-5 4-5h2c1.5 0 2.5 1 2.5 2.5S10.5 10.5 9 10.5H7" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M7 10.5c-1.5 0-2.5 1-2.5 2S5.5 14.5 7 14.5h5.5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M12.5 14.5c.8 0 1.5-.7 1.5-1.5V5a2 2 0 0 0-4 0v2" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconScore0({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke={color} strokeWidth="1.5"/>
      <path d="M7 7l6 6M13 7l-6 6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

export function IconScore1({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke={color} strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="1.5" fill={color}/>
      <path d="M10 5v2M10 13v2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function IconScore2({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 2a8 8 0 0 1 0 16" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 2a8 8 0 0 0 0 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3"/>
    </svg>
  )
}

export function IconScore3({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke={color} strokeWidth="1.5"/>
      <path d="M6.5 10.5l2.5 2.5 5-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconScore4({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 12L4 8l6-4 6 4-6 4Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M4 8v4l6 4 6-4V8" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconScore5({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 2l1.8 5.5H18l-4.9 3.6 1.9 5.8L10 13.5l-5 3.4 1.9-5.8L2 7.5h6.2L10 2Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  )
}