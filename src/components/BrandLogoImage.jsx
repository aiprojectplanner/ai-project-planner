import React from 'react'

import brandLogoFull from '../assets/brand-logo-full.png'

/**
 * Website logo component based on a single provided PNG.
 *
 * Note: the PNG already contains text; in `mark` mode we crop the left part
 * (icon area) by using `objectFit: cover` + `objectPosition: left center`.
 */
const BrandLogoImage = ({
  variant = 'mark', // 'mark' | 'full'
  size = 32, // px
  className = '',
  title = 'AI Project Planner'
}) => {
  if (variant === 'full') {
    return (
      <img
        src={brandLogoFull}
        alt={title}
        draggable={false}
        className={className}
        style={{ height: size, width: 'auto', display: 'block' }}
      />
    )
  }

  return (
    <img
      src={brandLogoFull}
      alt={title}
      draggable={false}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: 'cover',
        objectPosition: 'left center',
        display: 'block'
      }}
    />
  )
}

export default BrandLogoImage

