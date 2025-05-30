import fs from 'fs/promises';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type/core';
import ffmpeg from 'fluent-ffmpeg';

const MAX_SIZE_MB = 50;
const MAX_HEIGHT = 1080;

type VideoStream = { width: number; height: number };

/**
 * Validate, upload a video file, and generate its thumbnail.
 * @param {Buffer} fileBuffer - Le buffer de la vidéo téléchargée.
 * @param {string} destinationPath - Chemin de destination pour sauvegarde.
 * @returns {Promise<{videoPath: string, thumbnailPath: string}>} - Chemins de la vidéo et de la miniature.
 * @throws {Error} - Si la validation échoue.
 */
export async function validateAndUploadVideo(
     fileBuffer: Buffer,
     destinationPath: string
): Promise<{ videoPath: string, thumbnailPath: string }> {
     // 1. Vérification du buffer
     if (!fileBuffer) {
          throw new Error('Aucun buffer fourni');
     }

     // 2. Détection du MIME type
     const typeResult = await fileTypeFromBuffer(fileBuffer);
     if (!typeResult || !typeResult.mime.startsWith('video/')) {
          throw new Error(`Type de fichier non autorisé : attendu une vidéo, reçu ${typeResult?.mime || 'inconnu'}`);
     }

     // 3. Vérification de la taille
     const sizeMB = fileBuffer.byteLength / 1024 / 1024;
     if (sizeMB > MAX_SIZE_MB) {
          throw new Error(`Poids de la vidéo trop élevé : maximum ${MAX_SIZE_MB}Mo, reçu ${sizeMB.toFixed(2)}Mo`);
     }

     // 4. Vérification de la résolution via ffprobe
     // Écrire le buffer dans un fichier temporaire
     const os = await import('os');
     const tmpDir = os.tmpdir();
     const tmpFile = path.join(tmpDir, `video-${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`);
     await fs.writeFile(tmpFile, fileBuffer);

     let metadata: VideoStream | undefined;
     try {
          metadata = await new Promise<VideoStream | undefined>((resolve, reject) => {
               ffmpeg.ffprobe(tmpFile, (err, data) => {
                    if (err) return reject(err);
                    const stream = data.streams.find(s => typeof s.width === 'number' && typeof s.height === 'number');
                    if (stream) {
                         resolve({ width: stream.width as number, height: stream.height as number });
                    } else {
                         resolve(undefined);
                    }
               });
          });
     } finally {
          await fs.unlink(tmpFile).catch(() => { });
     }

     if (!metadata) {
          throw new Error('Impossible de récupérer les métadonnées vidéo');
     }
     if (metadata.height > MAX_HEIGHT) {
          throw new Error(`Résolution trop élevée : hauteur maximale ${MAX_HEIGHT}px, reçu ${metadata.height}px`);
     }

     // 5. Upload local
     const dir = path.dirname(destinationPath);
     await fs.mkdir(dir, { recursive: true });
     await fs.writeFile(destinationPath, fileBuffer);

     // 6. Génération de la vignette
     const thumbnailPath = destinationPath.replace(/\.[^/.]+$/, "") + "_thumb.jpg";

     await generateThumbnail(destinationPath, thumbnailPath);

     return {
          videoPath: destinationPath,
          thumbnailPath: thumbnailPath
     };
}

/**
 * Génère une vignette pour une vidéo donnée.
 * @param {string} videoPath - Le chemin vers la vidéo.
 * @param {string} outputPath - Le chemin où sauvegarder la vignette.
 * @returns {Promise<void>}
 */
async function generateThumbnail(videoPath: string, outputPath: string): Promise<void> {
     return new Promise((resolve, reject) => {
          ffmpeg(videoPath)
               .screenshots({
                    count: 1,            // Génère 1 seule vignette
                    folder: path.dirname(outputPath),
                    filename: path.basename(outputPath),
                    size: '480x?',       // Largeur fixe, hauteur proportionnelle
                    timestamps: ['10%']  // Prend une image à 10% de la durée (évite l'image noire du début)
               })
               .on('end', () => resolve())
               .on('error', (err) => reject(new Error(`Erreur lors de la génération de la vignette: ${err.message}`)));
     });
}