import { useState, useEffect } from "react"

// ── Share Modal
function ShareModal({ url, title, onClose }) {
  const [copied, setCopied] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function shareTwitter() {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, "_blank")
  }

  function shareNative() {
    if (navigator.share) {
      navigator.share({ title, url })
    }
  }

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--bg)", borderRadius: "var(--radius)",
        border: "1px solid var(--border)", padding: "32px",
        width: 340, boxShadow: "0 16px 64px rgba(0,0,0,0.15)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Share this article</span>
          <button onClick={onClose} style={{
            background: "none", border: "none", fontSize: 18,
            color: "var(--text-tertiary)", cursor: "pointer", lineHeight: 1
          }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Copy link */}
          <button onClick={copyLink} style={{
            display: "flex", alignItems: "center", gap: 12,
            background: copied ? "var(--accent-soft)" : "var(--bg-secondary)",
            border: `1px solid ${copied ? "rgba(255,45,120,0.2)" : "var(--border)"}`,
            borderRadius: "var(--radius-sm)", padding: "14px 16px",
            cursor: "pointer", fontFamily: "var(--font)", transition: "all 0.2s"
          }}>
            <span style={{ fontSize: 18 }}>{copied ? "✓" : "🔗"}</span>
            <span style={{ fontSize: 14, fontWeight: 400, color: copied ? "var(--accent)" : "var(--text)" }}>
              {copied ? "Link copied!" : "Copy article link"}
            </span>
          </button>

          {/* Twitter/X */}
          <button onClick={shareTwitter} style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "var(--bg-secondary)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)", padding: "14px 16px",
            cursor: "pointer", fontFamily: "var(--font)"
          }}>
            <span style={{ fontSize: 18 }}>𝕏</span>
            <span style={{ fontSize: 14, fontWeight: 400, color: "var(--text)" }}>Share on X / Twitter</span>
          </button>

          {/* Native share (iMessage, Instagram, etc.) — only on supported devices */}
          {navigator.share && (
            <button onClick={shareNative} style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "var(--bg-secondary)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)", padding: "14px 16px",
              cursor: "pointer", fontFamily: "var(--font)"
            }}>
              <span style={{ fontSize: 18 }}>↗</span>
              <span style={{ fontSize: 14, fontWeight: 400, color: "var(--text)" }}>More options (iMessage, etc.)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Cite Modal
function CiteModal({ citation, onClose }) {
  const [copied, setCopied] = useState(false)

  function copyCite() {
    navigator.clipboard.writeText(citation.apa).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--bg)", borderRadius: "var(--radius)",
        border: "1px solid var(--border)", padding: "32px",
        width: 440, boxShadow: "0 16px 64px rgba(0,0,0,0.15)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Cite this article</span>
          <button onClick={onClose} style={{
            background: "none", border: "none", fontSize: 18,
            color: "var(--text-tertiary)", cursor: "pointer", lineHeight: 1
          }}>✕</button>
        </div>

        <div style={{
          background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border)", padding: "16px",
          marginBottom: 16
        }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>APA 7th edition</div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, fontWeight: 300, margin: 0, fontFamily: "monospace" }}>
            {citation.apa}
          </p>
        </div>

        <button onClick={copyCite} style={{
          width: "100%", background: copied ? "var(--accent-soft)" : "var(--accent)",
          color: copied ? "var(--accent)" : "#fff",
          border: copied ? "1px solid rgba(255,45,120,0.2)" : "none",
          borderRadius: 100, padding: "11px",
          fontFamily: "var(--font)", fontSize: 14, fontWeight: 500,
          cursor: "pointer", transition: "all 0.2s"
        }}>
          {copied ? "✓ Copied to clipboard" : "Copy citation"}
        </button>
      </div>
    </div>
  )
}

// ── Main exported bar
export default function ArticleBar({ url, title, citation, presetLikes, storageKey }) {
  const [showShare, setShowShare] = useState(false)
  const [showCite, setShowCite] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(presetLikes)

  // Persist like state
  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored === "true") { setLiked(true); setLikes(presetLikes + 1) }
  }, [])

  function toggleLike() {
    const next = !liked
    setLiked(next)
    setLikes(next ? presetLikes + 1 : presetLikes)
    localStorage.setItem(storageKey, next ? "true" : "false")
  }

  const btnStyle = {
    display: "flex", alignItems: "center", gap: 8,
    background: "var(--bg-secondary)", border: "1px solid var(--border)",
    borderRadius: 12, padding: "10px 16px",
    cursor: "pointer", fontFamily: "var(--font)",
    fontSize: 13, color: "var(--text-secondary)", fontWeight: 400,
    transition: "all 0.15s"
  }

  return (
    <>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--border)" }}>
        {/* Like */}
        <button
          onClick={toggleLike}
          style={{
            ...btnStyle,
            background: liked ? "var(--accent-soft)" : "var(--bg-secondary)",
            border: liked ? "1px solid rgba(255,45,120,0.2)" : "1px solid var(--border)",
            color: liked ? "var(--accent)" : "var(--text-secondary)",
          }}
          onMouseEnter={e => !liked && (e.currentTarget.style.borderColor = "rgba(255,45,120,0.3)")}
          onMouseLeave={e => !liked && (e.currentTarget.style.borderColor = "var(--border)")}
        >
          <span style={{ fontSize: 16 }}>{liked ? "♥" : "♡"}</span>
          <span>{likes} {likes === 1 ? "like" : "likes"}</span>
        </button>

        {/* Share */}
        <button
          onClick={() => setShowShare(true)}
          style={btnStyle}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,45,120,0.3)"; e.currentTarget.style.color = "var(--text)" }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)" }}
        >
          <span style={{ fontSize: 16 }}>↗</span>
          <span>Share</span>
        </button>

        {/* Cite */}
        <button
          onClick={() => setShowCite(true)}
          style={btnStyle}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,45,120,0.3)"; e.currentTarget.style.color = "var(--text)" }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)" }}
        >
          <span style={{ fontSize: 16 }}>❝</span>
          <span>Cite</span>
        </button>
      </div>

      {showShare && <ShareModal url={url} title={title} onClose={() => setShowShare(false)} />}
      {showCite && <CiteModal citation={citation} onClose={() => setShowCite(false)} />}
    </>
  )
}