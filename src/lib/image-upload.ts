const MAX_DIMENSION = 1920
const JPEG_QUALITY = 0.8

const ALLOWED_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'image/heic', 'image/heif',
]

export function validateImageFile(file: File): string | null {
  // No size limit — compressImage handles weight automatically
  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    const tipo = file.type || 'desconhecido'
    return `Tipo de arquivo não suportado (${tipo}). Use JPEG, PNG, WebP ou HEIC.`
  }
  return null
}

async function toLoadableBlob(file: File): Promise<Blob> {
  const type = file.type.toLowerCase()
  if (type === 'image/heic' || type === 'image/heif' || file.name.match(/\.hei[cf]$/i)) {
    // heic2any is heavy — lazy import so it only loads when needed
    const heic2any = (await import('heic2any')).default
    const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
    return Array.isArray(result) ? result[0] : result
  }
  return file
}

export async function compressImage(file: File): Promise<Blob> {
  const source = await toLoadableBlob(file)

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(source)

    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Falha ao criar contexto da imagem')); return }
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Falha ao comprimir imagem'))
        },
        'image/jpeg',
        JPEG_QUALITY
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível carregar a imagem'))
    }

    img.src = url
  })
}
