export const thicknessLabels: Record<number, string> = {
  [-3]: 'かなり細め',
  [-2]: '細め',
  [-1]: 'やや細め',
  0: '標準',
  1: 'やや太め',
  2: '太め',
  3: 'かなり太め',
}

export const densityLabels: Record<number, string> = {
  [-3]: 'かなり薄め',
  [-2]: '薄め',
  [-1]: 'やや薄め',
  0: '標準',
  1: 'やや濃い',
  2: '濃い',
  3: 'かなり濃い',
}

export function formatSignedLevel(value: number) {
  return value > 0 ? `+${value}` : String(value)
}

export function formatLevelValue(value: number, labels: Record<number, string>) {
  const label = labels[value]
  return label ? `${formatSignedLevel(value)}（${label}）` : formatSignedLevel(value)
}
