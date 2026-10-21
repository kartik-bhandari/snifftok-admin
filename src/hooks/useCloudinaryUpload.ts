import { useCallback, useRef, useState } from 'react'
import axios from 'axios'
import { getUploadSignature } from '@/api/uploads'

export interface UploadedImage {
  url:       string
  publicId:  string
  width?:    number
  height?:   number
  order:     number
  progress?: number          // 0-100, undefined = done
  error?:    string
  localId:   string          // temp id for tracking
}

/**
 * Resize an image file to max `maxPx` on the longest side using canvas.
 * Returns the original file if it's already small enough.
 */
async function resizeImage(file: File, maxPx = 1600): Promise<Blob> {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      if (img.naturalWidth <= maxPx && img.naturalHeight <= maxPx) {
        resolve(file)
        return
      }
      const scale  = maxPx / Math.max(img.naturalWidth, img.naturalHeight)
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.naturalWidth  * scale)
      canvas.height = Math.round(img.naturalHeight * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(blob => resolve(blob ?? file), file.type, 0.88)
    }
    img.src = url
  })
}

export function useCloudinaryUpload() {
  const [images, setImages]             = useState<UploadedImage[]>([])
  const [isUploading, setIsUploading]   = useState(false)
  const uploadedPublicIds               = useRef<string[]>([])

  const updateImage = useCallback((localId: string, patch: Partial<UploadedImage>) => {
    setImages(prev => prev.map(img => img.localId === localId ? { ...img, ...patch } : img))
  }, [])

  const uploadFile = useCallback(async (file: File, order: number) => {
    const localId = `${Date.now()}-${Math.random()}`
    const preview = URL.createObjectURL(file)

    setImages(prev => [...prev, {
      url:      preview,
      publicId: '',
      order,
      progress: 0,
      localId,
    }])

    try {
      // Resize to max 1600px before upload
      const blob      = await resizeImage(file)
      const sig       = await getUploadSignature()

      // Only send params that were included in the signature (folder + timestamp).
      // Adding extra unsigned params causes Cloudinary to reject the signature.
      const formData  = new FormData()
      formData.append('file',      blob, file.name)
      formData.append('api_key',   sig.apiKey)
      formData.append('timestamp', String(sig.timestamp))
      formData.append('signature', sig.signature)
      formData.append('folder',    sig.folder)

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        formData,
        {
          onUploadProgress: ({ loaded, total }) => {
            if (total) updateImage(localId, { progress: Math.round((loaded / total) * 100) })
          },
        },
      )

      const { secure_url, public_id, width, height } = res.data
      URL.revokeObjectURL(preview)
      uploadedPublicIds.current.push(public_id)

      updateImage(localId, {
        url:      secure_url,
        publicId: public_id,
        width,
        height,
        progress: undefined,
      })
    } catch (err: any) {
      updateImage(localId, {
        error:    err?.response?.data?.error?.message ?? 'Upload failed.',
        progress: undefined,
      })
    }
  }, [updateImage])

  const addFiles = useCallback(async (files: File[]) => {
    setIsUploading(true)
    const startOrder = images.length
    await Promise.all(files.map((f, i) => uploadFile(f, startOrder + i)))
    setIsUploading(false)
  }, [images.length, uploadFile])

  const removeImage = useCallback((localId: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.localId !== localId)
      // Recompute order
      return updated.map((img, i) => ({ ...img, order: i }))
    })
  }, [])

  const reorderImages = useCallback((from: number, to: number) => {
    setImages(prev => {
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next.map((img, i) => ({ ...img, order: i }))
    })
  }, [])

  const setExistingImages = useCallback((imgs: UploadedImage[]) => {
    setImages(imgs)
    uploadedPublicIds.current = imgs.map(i => i.publicId)
  }, [])

  const getPublicIdsForDiscard = useCallback((): string[] => {
    const current = new Set(images.map(i => i.publicId).filter(Boolean))
    return uploadedPublicIds.current.filter(id => !current.has(id))
  }, [images])

  return {
    images,
    isUploading,
    addFiles,
    removeImage,
    reorderImages,
    setExistingImages,
    getPublicIdsForDiscard,
    validImages: images.filter(img => img.publicId && !img.error),
  }
}
