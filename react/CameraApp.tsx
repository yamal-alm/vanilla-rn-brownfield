
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

import { initOCR, runOCRFromBitmap } from './ocr/OnnxRuntime';

export default function CameraApp() {
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);
  const { hasPermission, requestPermission } = useCameraPermission();

  // ===== Estados que faltaban =====
  const [initializingOcr, setInitializingOcr] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState<string>('');

  // ===== Inicializar OCR al montar =====
  useEffect(() => {
    (async () => {
      try {
        setInitializingOcr(true);
        await initOCR();
        console.log('OCR listo ✅');
      } catch (e) {
        console.error('Fallo al inicializar OCR', e);
        Alert.alert('OCR', 'No se pudo inicializar el OCR. Revisa los modelos .onnx en iOS/Android.');
      } finally {
        setInitializingOcr(false);
      }
    })();
  }, []);

  // ===== Permisos de cámara =====
  useEffect(() => {
    (async () => {
      if (!hasPermission) {
        await requestPermission();
      }
    })();
  }, [hasPermission, requestPermission]);

  // ============================================
  // UTIL: convertir foto a RGB Uint8Array (placeholder)
  // ============================================
  async function decodePhotoToRGB(photoPath: string): Promise<{ rgb: Uint8Array; width: number; height: number }> {
    // TODO (elige 1 vía):
    // VÍA A) Frame Processor (recomendada): usa VisionCamera + plugin para obtener frame y píxeles directamente (más rápido, sin disco).
    // VÍA B) Decodificar JPEG/PNG: usa una librería nativa para decodificar la imagen a RGBA y luego convertir a RGB.
    //
    // Por ahora, dejamos un error claro para que no pase desapercibido:
    throw new Error(
      'Falta implementar decodePhotoToRGB(photoPath). ' +
      'Opción recomendada: usar Frame Processor para extraer RGB del frame. ' +
      'Alternativa: decodificar JPEG/PNG nativamente y mapear a Uint8Array RGB.'
    );

    // Ejemplo de retorno esperado:
    // return { rgb: yourUint8ArrayRGB, width: W, height: H };
  }

  // ============================================
  // Capturar, convertir a RGB y pasar por OCR
  // ============================================
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current) return;
    if (processing) return;

    try {
      setProcessing(true);
      setRecognizedText('');

      // 1) Sacar foto
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
        qualityPrioritization: 'balanced', // 'speed' si quieres ir más rápido
        enableShutterSound: false,
      });

      // `photo.path` → ruta del archivo (p.ej. file:///...) en iOS/Android
      const photoPath = photo.path;
      if (!photoPath) {
        throw new Error('No se obtuvo path de la foto');
      }

      // 2) Decodificar a RGB (Uint8Array) + dimensiones
      const { rgb, width, height } = await decodePhotoToRGB(photoPath);

      // 3) Ejecutar OCR
      const results = await runOCRFromBitmap(rgb, width, height);

      // 4) Unir resultados en una sola cadena (puedes formatear por líneas/orden)
      const text = results.map(r => r.text).join(' ');
      setRecognizedText(text || '(Sin texto detectado)');

      // 5) Limpieza opcional: borrar la foto del disco si no la necesitas
      try {
        if (photoPath.startsWith('file://')) {
          await RNFS.unlink(photoPath.replace('file://', ''));
        } else {
          await RNFS.unlink(photoPath);
        }
      } catch (e) {
        // no es crítico
      }
    } catch (err: any) {
      console.error('Error en handleCapture:', err);
      Alert.alert('OCR', err?.message ?? 'Error al procesar la imagen');
    } finally {
      setProcessing(false);
    }
  }, [processing]);

  if (!hasPermission || !device) {
    return (
      <View style={styles.center}>
        <Text>Se requiere permiso de cámara para usar esta función.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Capa de controles */}
      <View style={styles.controls}>
        {initializingOcr ? (
          <View style={styles.statusRow}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.statusText}>Inicializando OCR…</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleCapture}
            style={[styles.captureBtn, processing && styles.captureBtnDisabled]}
            disabled={processing}
            activeOpacity={0.8}
          >
            {processing ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.captureText}>Capturar</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Panel de resultado */}
      {recognizedText ? (
        <View style={styles.resultPanel}>
          <Text style={styles.resultTitle}>Texto reconocido</Text>
          <Text style={styles.resultText}>{recognizedText}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  statusRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusText: { color: '#fff' },

  captureBtn: {
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ddd',
  },
  captureBtnDisabled: {
    opacity: 0.6,
  },
  captureText: { fontWeight: 'bold', color: '#000' },

  resultPanel: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 8,
  },
  resultTitle: { color: '#fff', fontWeight: 'bold', marginBottom: 6 },
  resultText: { color: '#fff' },
});
