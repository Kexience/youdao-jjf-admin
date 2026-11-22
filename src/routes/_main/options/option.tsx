import { createFileRoute } from '@tanstack/react-router'

import { Options } from '../../../views/options/Options'

export const Route = createFileRoute('/_main/options/option')({
  component: OptionsRoute,
})

function OptionsRoute() {
  return <Options />
}
