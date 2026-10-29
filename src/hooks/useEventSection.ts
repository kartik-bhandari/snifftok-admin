import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getEventSection, saveEventSection } from '@/api/eventSection'

export const EVENT_SECTION_KEY = ['event-section'] as const

export function useEventSection() {
  return useQuery({ queryKey: EVENT_SECTION_KEY, queryFn: getEventSection })
}

/** Toasts are left to the caller — the message depends on what changed */
export function useSaveEventSection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: saveEventSection,
    onSuccess: () => qc.invalidateQueries({ queryKey: EVENT_SECTION_KEY }),
  })
}
