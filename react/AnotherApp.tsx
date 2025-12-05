import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { LLAMA3_2_1B, Message, useLLM } from 'react-native-executorch';

export default function AnotherApp() {
  const [response, setResponse] = useState('');
  const llm = useLLM({ model: LLAMA3_2_1B });

  const handleGenerate = async () => {
    setResponse('Generating response...');
    const chat: Message[] = [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: 'What is the meaning of life?' }
    ];

    // Chat completion
    await llm.generate(chat);
    console.log('Llama says:', llm.response);
    setResponse(llm.response || 'No response generated');
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text style={{marginTop: 20}}>This is Another React screen</Text>
      <Button title="Generate Response" onPress={handleGenerate} />
      {response ? <Text style={{marginTop: 20}}>{response}</Text> : null}
    </View>
  );
}
