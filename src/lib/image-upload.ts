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

/**
 * Nome de arquivo que o Storage aceita como parte da chave (KAN-883).
 *
 * O Storage recusa com 400 InvalidKey chave com acento, colchete, jogo da velha
 * ou emoji, e foto de celular costuma vir como "Foto São Miguel (1).jpg" ou
 * "IMG 😀.jpg". Aqui o nome vira so minusculas, digitos e hifen, sem extensao
 * (quem monta o caminho poe `.jpg`, porque toda foto sai recomprimida em JPEG).
 */
export function nomeSeguroDeFoto(nomeOriginal: string): string {
  const semExtensao = nomeOriginal.replace(/\.[^.]+$/, '')
  const nome = semExtensao
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
  return nome || 'foto'
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
