import logoUrl from "../assets/tafakuri-logo.png"

export default function BrandLogo({
  height = 48,
  inverted = false,
}: {
  height?: number
  inverted?: boolean
}) {
  return (
    <img
      src={logoUrl}
      alt="Tafakuri by Ndomi"
      style={{
        height,
        width: "auto",
        display: "block",
        filter: inverted ? "brightness(0) invert(1)" : undefined,
      }}
    />
  )
}
