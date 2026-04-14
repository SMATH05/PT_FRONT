function Button({
  children,
  className = '',
  type = 'button',
  variant = 'primary',
  ...props
}) {
  const classes = [`${variant}-button`, className].filter(Boolean).join(' ')

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}

export default Button
