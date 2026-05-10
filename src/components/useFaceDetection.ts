import { useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

export interface DetectedFace {
  photoUrl: string;
  faceId: string; // unique per face (hash of descriptor)
  box: faceapi.Box;
  descriptor: Float32Array;
}

// Helper: compute Euclidean distance between two Float32Array descriptors
function euclideanDistance(a: Float32Array, b: Float32Array) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export function useFaceDetection(photoUrls: string[]) {
  const [faces, setFaces] = useState<DetectedFace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        const allFaces: DetectedFace[] = [];
        for (const url of photoUrls) {
          if (cancelled) return; // Prevent running after unmount
          let img: HTMLImageElement | null = null;
          try {
            img = await faceapi.fetchImage(url);
          } catch (imgErr) {
            console.error(`[FaceDetection] Failed to fetch image: ${url}`, imgErr);
            continue; // Skip this image
          }
          try {
            const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
            if (cancelled) return;
            detections.forEach((det) => {
              allFaces.push({
                photoUrl: url,
                faceId: '', // will be set after clustering
                box: det.detection.box,
                descriptor: det.descriptor,
              });
            });
          } catch (detectErr) {
            console.error(`[FaceDetection] Error running face detection on: ${url}`, detectErr);
          }
        }
        // --- CLUSTERING LOGIC ---
        // Group faces by descriptor similarity (same person)
        const threshold = 0.5; // Lower = stricter, 0.5 is typical for face-api.js
        const clusters: { descriptor: Float32Array, faces: number[] }[] = [];
        allFaces.forEach((face, idx) => {
          let found = false;
          for (const cluster of clusters) {
            if (euclideanDistance(face.descriptor, cluster.descriptor) < threshold) {
              cluster.faces.push(idx);
              found = true;
              break;
            }
          }
          if (!found) {
            clusters.push({ descriptor: face.descriptor, faces: [idx] });
          }
        });
        // Assign clusterId as faceId for all faces in the same cluster
        clusters.forEach((cluster, i) => {
          cluster.faces.forEach(idx => {
            allFaces[idx].faceId = `face-${i}`;
          });
        });
        if (!cancelled) setFaces(allFaces);
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        if (!cancelled) setError(errMsg || 'Face detection failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (photoUrls.length > 0) run();
    return () => { cancelled = true; };
  }, [photoUrls]); // Use photoUrls array as dependency

  return { faces, loading, error };
}
