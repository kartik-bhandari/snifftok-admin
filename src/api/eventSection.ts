import { apiFetch, apiPut } from './client'
import type { EventSection, EventSectionUpdate } from '@/types/api'

export function getEventSection(): Promise<EventSection> {
  return apiFetch<EventSection>('/api/admin/settings/event-section')
}

export function saveEventSection(data: EventSectionUpdate): Promise<{ ok: boolean }> {
  return apiPut('/api/admin/settings/event-section', data)
}
