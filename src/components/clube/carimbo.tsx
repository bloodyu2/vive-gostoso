/** Carimbo redondo da capa: o texto gira num anel e "100% grátis" fica no centro.
 *  SVG puro, sem imagem, herda a cor do texto (currentColor). */
export function Carimbo({ centro, anel }: { centro: string; anel: string }) {
  const partes = centro.split(' ')
  return (
    <svg className="clube-carimbo" viewBox="0 0 120 120" role="img" aria-label={`${centro}. ${anel.replace(/[·]/g, ',')}`}>
      <defs>
        <path id="clube-anel" d="M60 60 m-47 0 a47 47 0 1 1 94 0 a47 47 0 1 1 -94 0" />
      </defs>
      <circle cx="60" cy="60" r="57" fill="rgba(8,44,44,0.55)" stroke="currentColor" strokeWidth="2" />
      <circle cx="60" cy="60" r="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 3" />
      <g className="clube-carimbo-anel" aria-hidden="true">
        <text fontSize="9.5" fill="currentColor">
          <textPath href="#clube-anel" startOffset="0" textLength="292" lengthAdjust="spacing">
            {anel}
          </textPath>
        </text>
      </g>
      <g aria-hidden="true" textAnchor="middle" fill="currentColor" fontFamily="var(--font-clube-titulo), system-ui, sans-serif" fontWeight="800">
        <text x="60" y={partes.length > 1 ? 58 : 66} fontSize="23">
          {partes[0]}
        </text>
        {partes.length > 1 ? (
          <text x="60" y="76" fontSize="15" letterSpacing="0.05em">
            {partes.slice(1).join(' ')}
          </text>
        ) : null}
      </g>
    </svg>
  )
}
