export default function BrandLogo({
  height = 36,
  inverted = false,
}: {
  height?: number
  inverted?: boolean
}) {
  return (
    <img
      src="/Tafakuri-logo.png"
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
