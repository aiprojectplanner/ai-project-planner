import React from 'react'

// Use a versioned filename to avoid stale browser/Vite caching.
import brandLogoFull from '../assets/brand-logo-full-v2.png'

/**
 * Website logo component based on a single provided PNG.
 *
 * Requirements:
 * - Do not scale the logo content (keep the PNG's intrinsic size).
 * - Center the logo inside its square container.
 * - Fill any unused space with white so the rounded outer container looks seamless.
 */
const BrandLogoImage = ({
  variant = 'mark', // 'mark' | 'full'
  size = 32, // px
  className = '',
  title = 'AI Project Planner'
}) => {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        position: 'relative',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        display: 'flex',
      }}
      data-variant={variant}
    >
      <img
        src={brandLogoFull}
        alt={title}
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain', // 保证完整不裁切（图片是正方形时也不会只显示一部分）
          objectPosition: 'center',
          display: 'block',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

export default BrandLogoImage

