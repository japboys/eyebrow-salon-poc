// 施術マーク記録機能：眉毛テンプレート画像上の「位置」と「マーク種別」を
// 構造化データとして記録するための型。画像としては保存しない。
// 将来のML/分析（位置別の頻度、来店回数ごとの変化、スタッフ傾向分析など）で
// customerId / treatmentId / visitNumber / markerType / eyebrowSide /
// normalizedX / normalizedY を結合キーとして使うことを想定している。

export type EyebrowSide = 'left' | 'right'

export type MarkerType = 'pluck' | 'cut'

export interface EyebrowTreatmentMark {
  id: string

  customerId: string
  treatmentId: string
  visitNumber: number

  eyebrowSide: EyebrowSide
  markerType: MarkerType

  x: number
  y: number

  normalizedX: number
  normalizedY: number

  imageWidth: number
  imageHeight: number

  orderIndex: number

  createdAt: string
  updatedAt: string
}
