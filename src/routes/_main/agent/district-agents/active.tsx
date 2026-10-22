import { createFileRoute } from '@tanstack/react-router'

import { DistrictAgentActive } from '../../../../views/districtAgents/DistrictAgentActive'

/** 在任区代查询条件：regionId 用于查询，regionCode 用于省/市/区级联回显 */
interface DistrictAgentActiveSearch {
  regionId?: number
  regionCode?: string
}

export const Route = createFileRoute('/_main/agent/district-agents/active')({
  validateSearch: (search: Record<string, unknown>): DistrictAgentActiveSearch => {
    const rawRegionId = search.regionId
    const regionId =
      typeof rawRegionId === 'number'
        ? rawRegionId
        : typeof rawRegionId === 'string'
          ? Number(rawRegionId)
          : NaN
    const regionCode =
      typeof search.regionCode === 'string' && /^\d{6}$/.test(search.regionCode)
        ? search.regionCode
        : undefined

    const result: DistrictAgentActiveSearch = {}
    // 接口要求 regionId ≥ 1 的整数，非法值直接丢弃（页面显示未查询状态）
    if (Number.isInteger(regionId) && regionId > 0) result.regionId = regionId
    if (regionCode) result.regionCode = regionCode
    return result
  },
  component: DistrictAgentActiveRoute,
})

function DistrictAgentActiveRoute() {
  return <DistrictAgentActive />
}
