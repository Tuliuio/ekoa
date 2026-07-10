interface EkoaLogoProps {
  className?: string;
  /** Render in white (for dark backgrounds) instead of brand green */
  invert?: boolean;
  /** Accepted for API compatibility — no-op */
  animateOnScroll?: boolean;
  /** Show the "MOBILIDADE ELÉTRICA" tagline under the wordmark */
  withTagline?: boolean;
}

const EkoaLogo = ({ className = "h-8", invert = false, withTagline = false }: EkoaLogoProps) => {
  const fill = invert ? "#FFFFFF" : "hsl(var(--primary))";

  return (
    <svg
      viewBox={withTagline ? "0 0 250 128" : "0 0 250 100"}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Ekoa Mobilidade Elétrica"
    >
      <text
        x="0"
        y="78"
        fontFamily="var(--font-display)"
        fontWeight={800}
        fontSize="92"
        letterSpacing="1"
        fill={fill}
      >
        EK
      </text>
      {/* lightning bolt replacing the "O" */}
      <path d="M150 12 L126 54 L143 54 L132 88 L170 42 L152 42 L163 12 Z" fill={fill} />
      <text
        x="176"
        y="78"
        fontFamily="var(--font-display)"
        fontWeight={800}
        fontSize="92"
        letterSpacing="1"
        fill={fill}
      >
        A
      </text>
      {withTagline && (
        <text
          x="125"
          y="118"
          textAnchor="middle"
          fontFamily="var(--font-body)"
          fontWeight={500}
          fontSize="13.5"
          letterSpacing="3.5"
          fill={fill}
        >
          MOBILIDADE ELÉTRICA
        </text>
      )}
    </svg>
  );
};

export default EkoaLogo;
