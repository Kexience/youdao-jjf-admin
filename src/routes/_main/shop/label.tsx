import { createFileRoute } from '@tanstack/react-router'

import { Labels } from '../../../views/shopLabels/Labels'

export const Route = createFileRoute('/_main/shop/label')({
  component: LabelsRoute,
})

function LabelsRoute() {
  return <Labels />
}
