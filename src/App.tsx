import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import HelloWorldModule from './HelloWorldModule';

const App: React.FC = () => {
	const [message, setMessage] = useState<string>('');

	const handleHelloPress = () => {
		try {
			const result = HelloWorldModule.hello('React Native');
			setMessage(result);
		} catch (error) {
			setMessage('Error calling TurboModule: ' + error);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>TurboModule Demo</Text>
			<TouchableOpacity style={styles.button} onPress={handleHelloPress}>
				<Text style={styles.buttonText}>Call Native Hello Method</Text>
			</TouchableOpacity>
			{message ? (
				<Text style={styles.message}>{message}</Text>
			) : null}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 30,
	},
	button: {
		backgroundColor: '#007AFF',
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 8,
		marginBottom: 20,
	},
	buttonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
	message: {
		fontSize: 18,
		textAlign: 'center',
		marginTop: 20,
		color: '#333',
	},
});

export default App;
