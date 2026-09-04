import { useState, useEffect, useRef } from 'react'
import {
  Wifi, Battery, Volume2, Search, ChevronRight,
  Folder, User, Mail, Briefcase,
  Film, Lightbulb, Cpu, Eye, FileText,
  Calendar, Clock, Settings, Phone, Sparkles,
  Heart, ArrowDown, Bomb,
} from 'lucide-react'
import './MacOSDesktop.css'

const BASE = import.meta.env.BASE_URL

/* ===== macOS Menu Bar ===== */
function MenuBar() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  const days = ['日', '一', '二', '三', '四', '五', '六']
  const dayName = days[time.getDay()]
  const timeStr = `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`
  const dateStr = `${time.getMonth() + 1}月${time.getDate()}日 周${dayName}`
  return (
    <div className="mac-menu-bar">
      <div className="mac-menu-left">
        <div className="mac-menu-item mac-menu-bold">
          <span className="mac-logo"></span>
          Finder
        </div>
        <div className="mac-menu-item">文件</div>
        <div className="mac-menu-item">编辑</div>
        <div className="mac-menu-item">显示</div>
        <div className="mac-menu-item">前往</div>
        <div className="mac-menu-item">窗口</div>
        <div className="mac-menu-item">帮助</div>
      </div>
      <div className="mac-menu-right">
        <div className="mac-menu-icon"><Search size={14} /></div>
        <div className="mac-menu-icon"><Volume2 size={14} /></div>
        <div className="mac-menu-icon"><Wifi size={14} /></div>
        <div className="mac-menu-icon"><Battery size={16} /></div>
        <div className="mac-menu-text">{dateStr}</div>
        <div className="mac-menu-text mac-time">{timeStr}</div>
      </div>
    </div>
  )
}

/* ===== Desktop Icon ===== */
function DesktopIcon({ icon: Icon, label, sublabel, color, onClick }) {
  return (
    <div className="mac-desktop-icon" onDoubleClick={onClick} onClick={(e) => {
      e.currentTarget.classList.toggle('selected')
    }}>
      <div className="mac-icon-img" style={{ background: color }}>
        <Icon size={28} color="#fff" strokeWidth={1.5} />
      </div>
      <div className="mac-icon-label">{label}</div>
      {sublabel && <div className="mac-icon-sublabel">{sublabel}</div>}
    </div>
  )
}

/* ===== Dock Icon ===== */
function DockIcon({ icon: Icon, label, color, imgSrc, onClick, isActive }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="mac-dock-item"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div
        className="mac-dock-icon-wrap"
        style={{
          background: imgSrc ? 'rgba(255,255,255,0.2)' : color,
          transform: hovered ? 'scale(1.6) translateY(-12px)' : 'scale(1)',
        }}
      >
        {imgSrc ? (
          <img src={imgSrc} alt={label} style={{
            width: hovered ? 34 : 24, height: hovered ? 34 : 24,
            objectFit: 'contain', imageRendering: 'pixelated',
          }} />
        ) : (
          <Icon size={hovered ? 34 : 24} color="#fff" strokeWidth={1.5} />
        )}
      </div>
      <div className="mac-dock-tooltip" style={{ opacity: hovered ? 1 : 0 }}>{label}</div>
      <div className={`mac-dock-dot ${isActive ? 'active' : ''}`}></div>
    </div>
  )
}

/* ===== Iframe with CSS injection — hides nav, hero, back button ===== */
function IframeContent({ src }) {
  const iframeRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

  const handleLoad = () => {
    const iframe = iframeRef.current
    if (!iframe) return
    try {
      const doc = iframe.contentDocument
      if (!doc) return
      const style = doc.createElement('style')
      style.textContent = `
        .top-nav, .back-home-btn, .nav-bar, header, .header, nav,
        [class*="hero"], [class*="Hero"],
        .archive-hero, .film-hero, .concepts-hero, .ai-lab-hero, .visual-hero,
        .hero-section, .hero-overlay, .hero-art-text,
        .scroll-hint, [class*="scroll-hint"], [class*="ScrollHint"],
        .nav, .navbar, .navigation, .nav-wrapper, .nav-container,
        .top-nav-wrapper, .nav-brand, .nav-links, .nav-menu,
        [class*="top-nav"], [class*="nav-brand"], [class*="nav-links"],
        .concepts-header, .films-header, .ai-lab-header, .visual-header,
        [class*="concepts-header"], [class*="films-header"] {
          display: none !important;
        }
        body, html {
          padding-top: 0 !important;
          margin-top: 0 !important;
          overflow-x: hidden;
        }
        .archive-scene, .studio-space, main, .main-content,
        .content-wrapper, .page-content, #app, .app {
          padding-top: 0 !important;
          margin-top: 0 !important;
          min-height: 100vh !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
        }
        .studio-space {
          min-height: 100vh !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
          padding-top: 0 !important;
        }
      `
      doc.head.appendChild(style)
      setLoaded(true)
    } catch (e) {
      console.log('Cannot inject CSS into iframe:', e)
      setLoaded(true)
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(250,250,252,0.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10, pointerEvents: 'none',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '3px solid rgba(0,0,0,0.08)', borderTopColor: '#3B82F6',
            animation: 'spin 0.6s linear infinite',
          }} />
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={src}
        onLoad={handleLoad}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block', opacity: loaded ? 1 : 0, transition: 'opacity 0.15s' }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        title="content"
      />
    </div>
  )
}

/* ===== macOS Window Modal with Fullscreen ===== */
function MacWindow({ title, onClose, children, width = 560, height = 420, initialFullscreen = false }) {
  const [isFullscreen, setIsFullscreen] = useState(initialFullscreen)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const prevPosition = useRef(null)

  useEffect(() => {
    if (!isFullscreen) {
      setPosition({
        x: (window.innerWidth - width) / 2,
        y: (window.innerHeight - height) / 2 - 20
      })
    }
  }, [width, height, isFullscreen])

  useEffect(() => {
    const handleESC = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleESC)
    return () => window.removeEventListener('keydown', handleESC)
  }, [isFullscreen])

  const onMouseDown = (e) => {
    if (isFullscreen) return
    setIsDragging(true)
    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0].clientX)
    const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0].clientY)
    dragStart.current = { x: clientX - position.x, y: clientY - position.y }
  }

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e) => {
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0].clientX)
      const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0].clientY)
      if (clientX === undefined) return
      setPosition({ x: clientX - dragStart.current.x, y: clientY - dragStart.current.y })
    }
    const onUp = () => setIsDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [isDragging])

  if (isFullscreen) {
    return (
      <div className="mac-window mac-window-fullscreen">
        <div className="mac-window-titlebar" onDoubleClick={() => setIsFullscreen(false)}>
          <div className="mac-traffic-lights">
            <div className="mac-tl mac-tl-close" onClick={onClose}></div>
            <div className="mac-tl mac-tl-min"></div>
            <div className="mac-tl mac-tl-max mac-tl-max-exit" onClick={() => setIsFullscreen(false)}></div>
          </div>
          <div className="mac-window-title">{title}</div>
          <div style={{ width: 60 }}></div>
        </div>
        <div className="mac-window-content" style={{ padding: 0, height: 'calc(100vh - 36px)', overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="mac-window" style={{ left: position.x, top: position.y, width, height }}>
      <div className="mac-window-titlebar" onMouseDown={onMouseDown} onTouchStart={onMouseDown} onDoubleClick={() => setIsFullscreen(true)}>
        <div className="mac-traffic-lights">
          <div className="mac-tl mac-tl-close" onClick={onClose}></div>
          <div className="mac-tl mac-tl-min"></div>
          <div className="mac-tl mac-tl-max" onClick={() => setIsFullscreen(true)}></div>
        </div>
        <div className="mac-window-title">{title}</div>
        <div style={{ width: 60 }}></div>
      </div>
      <div className="mac-window-content" style={{ padding: 0, height: height - 36, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

/* ===== Window Content: Projects Overview ===== */
function ProjectsContent({ onOpen }) {
  const projects = [
    { num: '01', icon: Film, label: 'FILMS', sub: '影像作品', desc: '短片、广告与实验影像 · 6部作品', color: '#3B82F6', id: 'films' },
    { num: '02', icon: Lightbulb, label: 'CONCEPTS', sub: '创意概念', desc: '从灵感到成片的完整创作链路 · 3个项目', color: '#8B5CF6', id: 'concepts' },
    { num: '03', icon: Cpu, label: 'AI LAB', sub: '智能实验室', desc: 'AIGC音乐、工作流与导演级可控 · 4个阶段', color: '#10B981', id: 'aiLab' },
    { num: '04', icon: Eye, label: 'VISUAL', sub: '视觉设计', desc: '海报、数字合成与商业摄影 · 10件作品', color: '#64748B', id: 'visual' },
  ]
  return (
    <div className="mac-projects-content" style={{ padding: '24px' }}>
      {projects.map(p => (
        <div className="mac-project-card" key={p.num} onClick={() => onOpen(p.id)}>
          <div className="mac-project-icon" style={{ background: p.color }}>
            <p.icon size={22} color="#fff" strokeWidth={1.5} />
          </div>
          <div className="mac-project-info">
            <div className="mac-project-label">{p.label}</div>
            <div className="mac-project-sub">{p.sub}</div>
            <div className="mac-project-desc">{p.desc}</div>
          </div>
          <ChevronRight size={18} color="#999" />
        </div>
      ))}
    </div>
  )
}

/* ===== Window Content: Contact ===== */
function ContactContent() {
  return (
    <div className="mac-contact-content" style={{ padding: '24px' }}>
      <div className="mac-contact-row">
        <Mail size={20} />
        <div>
          <div className="mac-contact-label">Email</div>
          <div className="mac-contact-value">113907111@qq.com</div>
        </div>
      </div>
      <div className="mac-contact-row">
        <Phone size={20} />
        <div>
          <div className="mac-contact-label">电话</div>
          <div className="mac-contact-value">13945701729</div>
        </div>
      </div>
      <div className="mac-contact-row">
        <Sparkles size={20} />
        <div>
          <div className="mac-contact-label">MBTI</div>
          <div className="mac-contact-value">ENTP · 开放合作</div>
        </div>
      </div>
      <div className="mac-contact-row">
        <Calendar size={20} />
        <div>
          <div className="mac-contact-label">合作邀约</div>
          <div className="mac-contact-value">如果你有好玩的想法，欢迎随时找我聊聊</div>
        </div>
      </div>
    </div>
  )
}

/* ===== Welcome Window Content ===== */
function WelcomeContent({ onOpen }) {
  return (
    <div style={{
      padding: '40px 32px', textAlign: 'center',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.6), rgba(245,245,247,0.4))',
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '20px',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'linear-gradient(135deg, #FF6B6B, #FF9500)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(255,107,107,0.3)',
      }}>
        <Heart size={32} color="#fff" fill="#fff" strokeWidth={0} />
      </div>
      <div>
        <div style={{
          fontSize: '1.5rem', fontWeight: 700, color: '#1A1A1A',
          marginBottom: '8px',
        }}>嗨~欢迎来到我的网络空间</div>
        <div style={{
          fontSize: '0.92rem', color: '#86868B', lineHeight: 1.6,
        }}>点击下方图标开始探索吧！</div>
      </div>
    </div>
  )
}

/* ===== Main MacOSDesktop ===== */
export default function MacOSDesktop({ visible }) {
  const [activeWindow, setActiveWindow] = useState(null)
  const [welcomeShown, setWelcomeShown] = useState(false)
  const [showPet, setShowPet] = useState(false)
  const [minesweeperSize, setMinesweeperSize] = useState({ width: 300, height: 420 })

  useEffect(() => {
    function handleMessage(e) {
      if (e.data && e.data.type === 'minesweeper-resize') {
        setMinesweeperSize({ width: e.data.width, height: e.data.height })
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    if (visible && !welcomeShown) {
      const timer = setTimeout(() => {
        setActiveWindow('welcome')
        setWelcomeShown(true)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [visible, welcomeShown])

  const largeW = Math.min(window.innerWidth * 0.88, 1100)
  const largeH = Math.min(window.innerHeight * 0.82, 680)
  const medW = Math.min(window.innerWidth * 0.78, 900)
  const medH = Math.min(window.innerHeight * 0.75, 620)

  const windows = {
    welcome: { title: '欢迎 — Welcome', content: <WelcomeContent onOpen={setActiveWindow} />, width: 480, height: 460 },
    about: { title: '关于我 — 刘怡彤 Sunny', content: <IframeContent src={`${BASE}creative-archive/creative-archive.html`} />, width: medW, height: medH },
    projects: { title: '作品项目', content: <ProjectsContent onOpen={setActiveWindow} />, width: 560, height: 420 },
    films: { title: '影像作品 — FILMS', content: <IframeContent src={`${BASE}creative-archive/films.html`} />, width: largeW, height: largeH },
    concepts: { title: '创意概念 — CONCEPTS', content: <IframeContent src={`${BASE}creative-archive/concepts.html`} />, width: largeW, height: largeH },
    aiLab: { title: 'AI实验室 — AI LAB', content: <IframeContent src={`${BASE}creative-archive/ai-lab.html`} />, width: largeW, height: largeH },
    visual: { title: '视觉设计 — VISUAL', content: <IframeContent src={`${BASE}creative-archive/visual.html`} />, width: largeW, height: largeH },
    minesweeper: { title: '扫雷 — Minesweeper', content: <IframeContent src={`${BASE}minesweeper/index.html`} />, width: minesweeperSize.width, height: minesweeperSize.height },
    contact: { title: '联系方式 — Contact', content: <ContactContent />, width: 480, height: 420 },
  }

  const dockItems = [
    { id: 'about', icon: User, label: '关于我', color: '#5AC8FA' },
    { id: 'projects', icon: Folder, label: '项目总览', color: '#3B82F6' },
    { id: 'films', icon: Film, label: '影像作品', color: '#F59E0B' },
    { id: 'concepts', icon: Lightbulb, label: '创意概念', color: '#8B5CF6' },
    { id: 'aiLab', icon: Cpu, label: 'AI实验室', color: '#10B981' },
    { id: 'visual', icon: Eye, label: '视觉设计', color: '#64748B' },
    { id: 'contact', icon: Mail, label: '联系方式', color: '#FF6B6B' },
  ]

  return (
    <div className={`macos-desktop ${visible ? 'visible' : ''}`}>
      <MenuBar />
      <div className="mac-wallpaper"></div>

      <div className="mac-widget-clock">
        <Clock size={40} strokeWidth={1} />
        <div className="mac-widget-label">刘怡彤Sunny</div>
      </div>

      {/* Desktop App Icons (centered) */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex', gap: '24px', zIndex: 3,
      }}>
        {/* Desktop Pet Icon */}
        <div
          onClick={() => setShowPet(!showPet)}
          style={{
            width: 52, height: 52, borderRadius: 14,
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 3px 10px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
            touchAction: 'manipulation',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img src={`${BASE}desktop-pet/app-icon.png`} alt="桌面宠物"
            style={{ width: 40, height: 40, imageRendering: 'pixelated' }} />
        </div>

        {/* Minesweeper Icon */}
        <div
          onClick={() => setActiveWindow('minesweeper')}
          style={{
            width: 52, height: 52, borderRadius: 14,
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 3px 10px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
            touchAction: 'manipulation',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img src={`${BASE}desktop-pet/minesweeper-icon.png`} alt="扫雷"
            style={{ width: 40, height: 40, imageRendering: 'pixelated' }} />
        </div>
      </div>

      {/* Desktop Pet walking freely on desktop */}
      {showPet && (
        <iframe
          src={`${BASE}desktop-pet/index.html`}
          style={{
            position: 'fixed', top: 0, left: 0,
            width: '100vw', height: '100vh',
            border: 'none', zIndex: 4,
            pointerEvents: 'none',
          }}
          title="Desktop Pet"
        />
      )}

      {activeWindow && windows[activeWindow] && (
        <MacWindow
          key={activeWindow}
          title={windows[activeWindow].title}
          onClose={() => setActiveWindow(null)}
          width={windows[activeWindow].width}
          height={windows[activeWindow].height}
          initialFullscreen={windows[activeWindow].initialFullscreen || false}
        >
          {windows[activeWindow].content}
        </MacWindow>
      )}

      <div className="mac-dock">
        {dockItems.map(item => (
          <DockIcon
            key={item.id}
            icon={item.icon}
            label={item.label}
            color={item.color}
            imgSrc={item.imgSrc}
            onClick={() => setActiveWindow(item.id)}
            isActive={activeWindow === item.id}
          />
        ))}
        <div className="mac-dock-divider"></div>
        <DockIcon icon={Settings} label="系统设置" color="#6B7280" onClick={() => {}} />
        <DockIcon icon={FileText} label="废纸篓" color="#9CA3AF" onClick={() => {}} />
      </div>
    </div>
  )
}
