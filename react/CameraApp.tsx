
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Text, Image, ActivityIndicator, ScrollView } from "react-native";
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import { useOCR, OCR_ENGLISH } from 'react-native-executorch';

export default function CameraApp() {
    const device = useCameraDevice('back');
    const cameraRef = useRef(null);
    const [photoUri, setPhotoUri] = useState(null);
    const [ocrDetections, setOcrDetections] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const model = useOCR({ model: OCR_ENGLISH });
    const { hasPermission, requestPermission } = useCameraPermission();

    const takePhoto = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePhoto({});
                // Ensure file:// prefix for Android local files
                let uri = photo.path;
                if (uri && !uri.startsWith('file://')) {
                    uri = 'file://' + uri;
                }
                setPhotoUri(uri);
                console.log('OCR - Photo taken:', photo);
            } catch (e) {
                console.error('Failed to take photo', e);
            }
        }
    };

    const analyzeImage = async () => {
        setIsAnalyzing(true);
        console.log("OCR - Analyzing image");
        try {
            const detections = [];
            for (const ocrDetection of await model.forward(photoUri)) {
                console.log('OCR - detected label: ', ocrDetection.text);
                detections.push(ocrDetection.text);
            }
            setOcrDetections(detections);
            console.log("OCR - Analysis complete");
        } catch (error) {
            console.error('OCR analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    }

    const reset = () => {
        setPhotoUri(null);
        setOcrDetections([]);
        setImageLayout(null);
        setIsAnalyzing(false);
    };


    useEffect(() => {
      if (!hasPermission) {
        requestPermission();
      }
    }, [hasPermission, requestPermission]);


    if (!hasPermission || !device) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>Camera permission is required to use this feature.</Text>
        </View>
      )
    }

    return (
        <View style={{ flex: 1 }}>
            {photoUri ? (
                <>
                    <Image
                        source={{ uri: photoUri }}
                        style={styles.fullPreview}
                        resizeMode="cover"
                        onLayout={(event) => {
                            const { width, height } = event.nativeEvent.layout;
                            console.log('Image layout:', width, height);
                        }}
                    />
                    
                    {ocrDetections.length > 0 && (
                        <View style={styles.ocrListContainer}>
                            <Text style={styles.ocrListTitle}>Detected Text:</Text>
                            <ScrollView style={styles.ocrList}>
                                {ocrDetections.map((text, index) => (
                                    <View key={index} style={styles.ocrListItem}>
                                        <Text style={styles.ocrListItemText}>
                                            {index + 1}. {text}
                                        </Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                    
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity style={styles.button} onPress={reset}>
                          <Text style={styles.buttonText}>Reset</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                            style={[styles.button, { marginTop: 12 }, isAnalyzing && styles.disabledButton]}
                            onPress={analyzeImage}
                            disabled={isAnalyzing}>
                          <Text style={styles.buttonText}>
                                {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
                          </Text>
                      </TouchableOpacity>
                    </View>
                    {isAnalyzing && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#2196F3" />
                            <Text style={styles.loadingText}>Analyzing image...</Text>
                        </View>
                    )}
                </>
            ) : (
                <>
                    <Camera
                        ref={cameraRef}
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={true}
                        photo={true}
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={takePhoto}>
                            <Text style={styles.buttonText}>Take Picture</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: '#2196F3',
        borderRadius: 30,
        paddingVertical: 16,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    fullPreview: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    disabledButton: {
        backgroundColor: '#999',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        marginTop: 12,
    },
    ocrListContainer: {
        position: 'absolute',
        top: 40,
        left: 20,
        right: 20,
        maxHeight: '50%',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        borderRadius: 12,
        padding: 16,
    },
    ocrListTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    ocrList: {
        maxHeight: 300,
    },
    ocrListItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    ocrListItemText: {
        color: '#fff',
        fontSize: 14,
    },
});
