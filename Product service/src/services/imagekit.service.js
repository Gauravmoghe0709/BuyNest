const ImageKit = require('imagekit')

let imagekitClient = null

function initImageKit() {
    if (imagekitClient) return imagekitClient

    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || process.env.IMAGEKIT_PUBLIC
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || process.env.IMAGEKIT_PRIVATE
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || process.env.IMAGEKIT_URL

    if (publicKey && privateKey && urlEndpoint) {
        imagekitClient = new ImageKit({
            publicKey,
            privateKey,
            urlEndpoint
        })
        return imagekitClient
    }

    // In test environment provide a no-op mock implementation so tests don't need real keys
    if (process.env.NODE_ENV === 'test') {
        imagekitClient = {
            upload: async (opts) => {
                return { url: 'https://example.com/test-image.jpg', fileId: 'test-file-id' }
            }
        }
        return imagekitClient
    }

    // Otherwise throw a clear error when initialization is attempted
    throw new Error('ImageKit Id, API Key and API secret are necessary for initialization.')
}

async function uploadfile(file, fileName) {
    const ik = initImageKit()

    const filename = fileName || (file && (file.originalname || Math.random().toString(36).slice(2, 8)))
    const uploadOpts = {
        file: file && file.buffer ? file.buffer : (file || ''),
        fileName: filename
    }

    // ImageKit SDK returns a promise when calling .upload with no callback
    const result = await ik.upload(uploadOpts)
    return result
}

module.exports = uploadfile