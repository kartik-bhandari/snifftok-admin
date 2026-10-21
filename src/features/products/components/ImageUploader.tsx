import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, GripVertical, AlertCircle, ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UploadedImage } from '@/hooks/useCloudinaryUpload'

interface Props {
  images:        UploadedImage[]
  isUploading:   boolean
  onAdd:         (files: File[]) => void
  onRemove:      (localId: string) => void
  onReorder:     (from: number, to: number) => void
  maxImages?:    number
  error?:        string
}

const ACCEPTED = { 'image/jpeg': [], 'image/png': [], 'image/webp': [] }
const MAX_SIZE = 5 * 1024 * 1024  // 5 MB

function cloudinaryUrl(url: string, w = 200) {
  // Inject transformation params into Cloudinary URL
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`)
}

export function ImageUploader({ images, isUploading, onAdd, onRemove, onReorder, maxImages = 8, error }: Props) {
  const canAdd = images.length < maxImages && !isUploading

  const onDrop = useCallback((files: File[]) => {
    const remaining = maxImages - images.length
    onAdd(files.slice(0, remaining))
  }, [images.length, maxImages, onAdd])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:   ACCEPTED,
    maxSize:  MAX_SIZE,
    disabled: !canAdd,
    multiple: true,
  })

  // Simple drag-to-reorder via mousedown
  let dragFrom: number | null = null

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {canAdd && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-accent/30',
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">
            {isDragActive ? 'Drop here…' : 'Drag images or click to browse'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG, WebP · max 5 MB · up to {maxImages} images
          </p>
        </div>
      )}

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.map((img, i) => (
            <div
              key={img.localId}
              className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
              draggable
              onDragStart={() => { dragFrom = i }}
              onDragOver={e => e.preventDefault()}
              onDrop={() => { if (dragFrom !== null && dragFrom !== i) onReorder(dragFrom, i); dragFrom = null }}
            >
              {/* Image or progress */}
              {img.progress !== undefined ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-background/80">
                  <div className="h-1 w-3/4 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-200"
                      style={{ width: `${img.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{img.progress}%</span>
                </div>
              ) : img.error ? (
                <div className="absolute inset-0 flex items-center justify-center bg-destructive/10">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
              ) : (
                <img
                  src={img.publicId ? cloudinaryUrl(img.url) : img.url}
                  alt={`Image ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Cover badge */}
              {i === 0 && !img.progress && !img.error && (
                <span className="absolute top-1 left-1 text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded-full">
                  Cover
                </span>
              )}

              {/* Drag handle */}
              <div className="absolute top-1 right-7 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                <GripVertical className="h-4 w-4 text-white drop-shadow" />
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => onRemove(img.localId)}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Add more */}
          {images.length < maxImages && !isUploading && (
            <div
              {...getRootProps()}
              className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors"
            >
              <input {...getInputProps()} />
              <ImagePlus className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  )
}
