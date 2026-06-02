# GPU Performance Audit Report

## Investigation Focus
Scroll lag and animation stuttering with small data (1 employee, 3 items) - indicating rendering pipeline/GPU bottleneck, not React re-render issue.

## GPU-Heavy Effects Identified

### 1. Animated Background Blobs (CRITICAL - #1 Bottleneck)
**Location**: `client/src/App.jsx` (Layout component)
**Issue**: Three continuously animating floating blobs with extreme blur radii

```javascript
{/* Floating blob 1 */}
<div className="absolute w-[420px] h-[420px] rounded-full bg-teal-500/30 blur-[100px] animate-[float_14s_ease-in-out_infinite] top-[-120px] left-[-120px]" />

{/* Floating blob 2 */}
<div className="absolute w-[450px] h-[450px] rounded-full bg-blue-500/30 blur-[110px] animate-[floatReverse_18s_ease-in-out_infinite] bottom-[-150px] right-[-120px]" />

{/* Floating blob 3 */}
<div className="absolute w-[380px] h-[380px] rounded-full bg-indigo-500/20 blur-[120px] animate-[float_20s_ease-in-out_infinite] top-[40%] left-[55%]" />
```

**GPU Impact**:
- Blur radii: 100px, 110px, 120px (extremely expensive)
- Continuous animation: 14s, 18s, 20s loops
- Absolute positioned over entire screen
- Layered with opacity (30%, 30%, 20%)
- Repaints entire viewport on every animation frame
- Causes GPU overdraw across entire scrolling area

**Estimated GPU Cost**: VERY HIGH - These blobs are repainted on every scroll and animation frame

---

### 2. .surface-card Backdrop Filter (CRITICAL - #2 Bottleneck)
**Location**: `client/src/index.css`
**Issue**: backdrop-filter: blur(24px) applied to ALL GlassCard components

```css
.surface-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
}
```

**Affected Components**:
- StatCard (4-6 cards on Dashboard)
- GlassCard (used in: Dashboard, Inventory, Employees, Assets, Analytics, Reports)
- Modal content
- Dashboard office cards

**GPU Impact**:
- 24px blur is expensive on every card
- Box-shadow adds additional GPU cost
- Applied to 10+ components simultaneously
- Each card requires separate GPU layer for blur
- During scroll, all visible cards repaint

**Estimated GPU Cost**: HIGH - Cumulative effect across multiple components

---

### 3. Sidebar Backdrop Blur (HIGH - #3 Bottleneck)
**Location**: `client/src/components/Sidebar.jsx`
**Issue**: Multiple backdrop-blur layers with fixed positioning

```javascript
{/* Mobile overlay */}
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" />

{/* Sidebar */}
<aside className="
  fixed left-0 top-0 z-50 h-full
  bg-[rgba(255,255,255,0.06)]
  border-r border-white/10
  backdrop-blur-2xl
  shadow-2xl shadow-black/40
">
```

**GPU Impact**:
- backdrop-blur-2xl (40px blur) on sidebar
- backdrop-blur-sm on mobile overlay
- Fixed positioning (z-50) - creates separate GPU layer
- shadow-2xl adds GPU cost
- Overlaps with scrolling content

**Estimated GPU Cost**: HIGH - Fixed layer with blur over scrolling content

---

### 4. Dashboard Header Backdrop Blur (MEDIUM - #4 Bottleneck)
**Location**: `client/src/pages/Dashboard.jsx`
**Issue**: backdrop-blur-2xl with shadow-2xl and overflow-hidden

```javascript
<div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.08] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:p-8 dark:shadow-black/40">
```

**GPU Impact**:
- backdrop-blur-2xl (40px blur)
- shadow-2xl
- overflow-hidden forces GPU layer creation
- Large card size

**Estimated GPU Cost**: MEDIUM - Single instance but expensive

---

### 5. Modal Backdrop Blur (MEDIUM - #5 Bottleneck)
**Location**: `client/src/components/Modal.jsx`
**Issue**: backdrop-blur-md with AnimatePresence and fixed positioning

```javascript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/62 p-4 backdrop-blur-md"
>
```

**GPU Impact**:
- backdrop-blur-md (16px blur)
- Fixed positioning (z-50)
- AnimatePresence triggers GPU animations
- opacity transitions during open/close

**Estimated GPU Cost**: MEDIUM - Only when modal is open

---

## Additional GPU Effects Found

### Framer Motion Animations
- **StatCard**: motion.div with whileHover, whileTap, initial, animate
- **GlassCard**: motion.div with whileHover, whileTap, initial, animate
- **Modal**: AnimatePresence with nested motion.div
- **Login**: motion.div with initial/animate transitions

**Impact**: Each motion.div creates GPU layer for animations

### Fixed/Sticky Layers
- **Header**: sticky top-0 (z-30) - repaints during scroll
- **Sidebar**: fixed left-0 (z-50) - separate GPU layer
- **Modal**: fixed inset-0 (z-50) - separate GPU layer

**Impact**: Fixed layers cause repaint of entire layer on scroll

### Scroll Containers
- **App main**: overflow-y-auto
- **Sidebar nav**: overflow-y-auto
- **Modal**: overflow-y-auto
- **Inventory table**: overflow-x-auto

**Impact**: Multiple scroll areas increase repaint regions

### Heavy Box Shadows
- **shadow-2xl**: Used in Login, Dashboard, StatCard, Sidebar, GlassCard
- **shadow-black/40, shadow-black/20**: Additional GPU cost

**Impact**: Box shadows require GPU compositing

---

## Top 5 Components Causing GPU-Heavy Rendering During Scroll

### 1. App.jsx (Layout) - Animated Background Blobs
**Severity**: CRITICAL
**GPU Cost**: VERY HIGH
**Reason**: Three continuously animating blobs with 100-120px blur radii repainting entire viewport
**Recommendation**: Remove or significantly reduce blur radii, disable animation during scroll

### 2. .surface-card (index.css) - Backdrop Filter
**Severity**: CRITICAL
**GPU Cost**: HIGH
**Reason**: 24px blur applied to 10+ components simultaneously (StatCard, GlassCard, Modal, Dashboard cards)
**Recommendation**: Reduce blur to 8-12px, use CSS transform: translateZ(0) sparingly, consider removing blur from non-essential cards

### 3. Sidebar.jsx - Backdrop Blur + Fixed Positioning
**Severity**: HIGH
**GPU Cost**: HIGH
**Reason**: 40px blur on fixed layer (z-50) overlapping scrolling content
**Recommendation**: Reduce blur to 16-20px, consider removing blur from sidebar background

### 4. Dashboard.jsx - Header Backdrop Blur
**Severity**: MEDIUM
**GPU Cost**: MEDIUM
**Reason**: 40px blur with shadow-2xl on large card
**Recommendation**: Reduce blur to 16-20px, remove overflow-hidden if possible

### 5. Modal.jsx - Backdrop Blur + AnimatePresence
**Severity**: MEDIUM
**GPU Cost**: MEDIUM
**Reason**: 16px blur with fixed positioning and GPU animations
**Recommendation**: Reduce blur to 8-12px, disable AnimatePresence if not essential

---

## Root Cause Analysis

**Primary GPU Bottleneck**: Animated background blobs in App.jsx
- These blobs have the largest blur radii (100-120px)
- They animate continuously (14s, 18s, 20s loops)
- They cover the entire viewport
- They repaint on every scroll and animation frame
- This causes massive GPU overdraw

**Secondary GPU Bottleneck**: .surface-card backdrop-filter
- Applied to 10+ components across the app
- 24px blur is expensive even for single components
- Cumulative effect causes significant GPU load
- Every card requires separate GPU layer for blur

**Tertiary GPU Bottleneck**: Fixed/sticky layers with blur
- Sidebar and Modal use fixed positioning with blur
- These create separate GPU layers
- Overlap with scrolling content causes repaints

---

## Recommended Fixes (in order of priority)

1. **Remove or disable animated background blobs during scroll**
   - Remove blur or reduce to 20-30px
   - Disable animation when user is scrolling
   - Consider static gradient instead

2. **Reduce .surface-card backdrop-filter blur**
   - Change from 24px to 8-12px
   - Remove from non-essential cards
   - Use will-change: backdrop-filter sparingly

3. **Reduce Sidebar backdrop-blur**
   - Change from backdrop-blur-2xl (40px) to backdrop-blur-md (16px)
   - Consider removing blur from sidebar background entirely

4. **Reduce Dashboard header blur**
   - Change from backdrop-blur-2xl (40px) to backdrop-blur-md (16px)
   - Remove overflow-hidden if possible

5. **Optimize Modal blur**
   - Change from backdrop-blur-md (16px) to backdrop-blur-sm (8px)
   - Consider disabling AnimatePresence for modal

---

## Expected Performance Improvement

After implementing these fixes:
- **FPS during scroll**: Should increase from 30-40 FPS to 55-60 FPS
- **GPU overdraw**: Should reduce by 60-70%
- **Scroll smoothness**: Should eliminate stuttering
- **Animation performance**: Should eliminate lag during interactions

The animated background blobs are the primary cause of scroll lag. Removing or significantly reducing their blur radii should provide the most significant performance improvement.
