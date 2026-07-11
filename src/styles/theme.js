// ─── Colors ───────────────────────────────────────────────────────────────────
export const colors = {
  // Brand / Primary
  primary:        "#0f172a",   // dark navy — header, buttons, FABs, chat bubbles
  primaryGradientEnd: "#14532d", // gradient end in header (web)
  accent:         "#f97316",   // orange — badges, prices, active states, FABs
  accentLight:    "#fff7ed",   // very light orange background
  accentMuted:    "#fff8f5",   // near-white orange tint (active choice row)

  // Green palette
  green:          "#16a34a",   // action green — arrows, scan-list border, cartItemEdit
  greenDark:      "#1b4332",   // forest green — QnA/FAQ titles
  greenMedium:    "#2d6a4f",   // medium forest — QnA buttons, outline border
  greenMuted:     "#52796f",   // teal-muted — QnA description text
  greenChat:      "#74c69d",   // light medium green — QnA meta, arrows
  greenPaleBg:    "#f0f7f0",   // pale green page background (QnA, FAQ)
  greenPaleBg2:   "#f0fdf4",   // scan-list btn background, card icon bg
  greenFormBg:    "#e9f5ec",   // QnA form card background
  greenBorder:    "#d8f3dc",   // QnA/FAQ card border
  greenBorderAlt: "#b7e4c7",   // QnA input border
  greenTagText:   "#166534",   // answered tag text
  greenTagBg:     "#dcfce7",   // answered tag background

  // Slate scale (dark → light)
  slate800:       "#1e293b",   // SeatsView category bar, viewer box bg
  slate700:       "#334155",   // dark-context borders, disabled time slot
  slate600:       "#475569",   // tab text (shopTagText), SeatsView badge text
  slate500:       "#64748b",   // secondary body text, seatDesc
  slate400:       "#94a3b8",   // muted labels, placeholders, notice text
  slate300:       "#cbd5e1",   // disabled button color
  slate200:       "#e2e8f0",   // visitCard border, inputRow border
  slate100:       "#f1f5f9",   // input backgrounds, category chips, tab bg
  slate50:        "#f8fafc",   // page / screen background

  // Red / Danger
  red:            "#ef4444",   // confirm-delete button, cancel card border
  redDark:        "#dc2626",   // stronger danger — cancel card title/warning
  redLight:       "#f87171",   // admin-logout button accent
  redPaleBg:      "#fff5f5",   // cancel card background

  // Blue / Info
  blue:           "#3b82f6",   // consent card border, rsvn badge rsvn color
  blueDark:       "#1e40af",   // consent summary text
  blueMedium:     "#1d4ed8",   // consent title
  bluePaleBg:     "#eff6ff",   // rsvn-count badge background, consent card bg

  // Indigo
  indigo:         "#6366f1",   // seat reservation button text
  indigoLight:    "#a5b4fc",   // seat reservation button border

  // Amber / Warning
  amber:          "#f59e0b",   // reservation-change card border
  amberDark:      "#b45309",   // change card title text
  amberPaleBg:    "#fffbeb",   // change card background

  // Misc named
  tossBlue:       "#0064FF",   // Toss Payments logo

  // Tag / Status backgrounds
  yellowTagBg:    "#fef9c3",   // pending tag background
  yellowTagText:  "#854d0e",   // pending tag text

  // Neutrals
  white:          "#ffffff",
  black:          "#000000",
  text:           "#111",      // primary text (near-black shorthand)
  textSecondary:  "#374151",   // payment order name, card text
  textMuted:      "#888",      // descriptions, meta
  textSubtle:     "#94a3b8",   // same as slate400, aliased for readability
  textLight:      "#aaa",      // lighter placeholder / hint text
  textFaint:      "#bbb",      // even lighter — visitCardAddr, noImgText
  textDisabled:   "#ccc",      // disabled states
  textGray:       "#555",      // medium gray — cancelBtnText, rankText
  textGrayAlt:    "#999",      // drawer item desc

  // Backgrounds
  bgBase:         "#f8fafc",   // default screen background (same as slate50)
  bgLight:        "#f5f5f5",   // menu container background
  bgCard:         "#ffffff",   // card / sheet white
  bgInput:        "#f3f4f6",   // qty row, quantity selector background
  bgInputAlt:     "#f1f5f9",   // chat input, enterInput background

  // Borders / Dividers
  border:         "#e5e7eb",   // standard border (inputs, cards)
  borderLight:    "#f0f0f0",   // very light dividers (sheetHeader, cartItem)
  borderMedium:   "#e2e8f0",   // visitCard border, roomBadge border
  divider:        "#f3f4f6",   // menu section divider height-8 strips

  // Overlays / Shadows
  overlayDark:    "rgba(0,0,0,0.5)",
  overlayLight:   "rgba(0,0,0,0.4)",
  overlayStrong:  "rgba(0,0,0,0.85)",
};

// ─── Border Radius ────────────────────────────────────────────────────────────
export const radius = {
  xs:     6,    // badge, small pill elements
  sm:     8,    // inputs, small buttons, tags
  md:     10,   // chips, minor card rounding
  lg:     12,   // cards, sheet items, buttons
  xl:     14,   // primary action buttons, cart bar buttons
  "2xl":  16,   // rounded containers, close buttons (circular at 16px diameter)
  "3xl":  20,   // modal sheets (top corners), large panels
  "4xl":  24,   // payment sheet, success card
  pill:   20,   // pill-shaped buttons (adminBtn, catChip, qtyRow)
  round:  9999, // fully round (circular icon buttons)
};

// ─── Font Sizes ───────────────────────────────────────────────────────────────
export const font = {
  "2xs":  9,    // badge text (smallest labels)
  xs:     10,   // required badge, tag text, zoom hint
  sm:     11,   // cart-item options, addr text, meta labels
  base:   12,   // secondary descriptions, notice text, form labels
  md:     13,   // body copy, button sub-text, drawer desc
  lg:     14,   // primary body, chat bubbles, inputs
  xl:     15,   // card names, sheet items, action buttons
  "2xl":  16,   // price text, cart button, send button
  "3xl":  17,   // panel headers, sheet titles
  "4xl":  18,   // shop name header, payment header title
  "5xl":  19,   // shopName
  "6xl":  20,   // base price, total price (detail view)
  "7xl":  22,   // section titles, payment total
  "8xl":  24,   // success/fail titles
  hero:   56,   // success/fail icon display
};

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const spacing = {
  "1":   4,
  "1.5": 6,
  "2":   8,
  "2.5": 10,
  "3":   12,
  "3.5": 14,
  "4":   16,
  "4.5": 18,
  "5":   20,
  "6":   24,
  "7":   28,
  "8":   32,
  "10":  40,
  "12":  48,
  "16":  64,
};
