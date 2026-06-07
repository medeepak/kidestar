export async function detectSingleFace(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<boolean> {
    // 1. Fast Path: Native Browser Shape Detection API
    // Supported primarily in Chrome/Android
    if ('FaceDetector' in window) {
        try {
            // @ts-ignore - experimental API
            const detector = new window.FaceDetector();
            const faces = await detector.detect(imageElement);
            return faces.length > 0;
        } catch (err) {
            console.warn('Native FaceDetector failed', err);
        }
    }

    // 2. Slow Path (Lazy loaded zero-bundle fallback)
    // For iOS Safari or Firefox users
    return new Promise((resolve) => {
        // @ts-ignore
        if (window.faceapi) {
            // @ts-ignore
            runFallback(window.faceapi, imageElement).then(resolve);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/dist/face-api.min.js';
        script.onload = async () => {
             // @ts-ignore
            runFallback(window.faceapi, imageElement).then(resolve);
        };
        script.onerror = () => {
            console.error('Failed to load fallback face-api. Allowing photo through safety net.');
            resolve(true); // Let backend moderation handle it if CDN blocked
        };
        document.head.appendChild(script);
    });
}

async function runFallback(faceapi: any, imageElement: HTMLImageElement | HTMLCanvasElement): Promise<boolean> {
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model');
        const detections = await faceapi.detectAllFaces(imageElement, new faceapi.TinyFaceDetectorOptions());
        return detections.length > 0;
    } catch (e) {
        console.warn('Fallback detection failed', e);
        return true; // Graceful allow if ML pipeline crashes locally
    }
}
