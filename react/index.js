import {AppRegistry} from 'react-native';
import App from './App.tsx';
import AnotherApp from './AnotherApp.tsx';

AppRegistry.registerComponent('HelloWorld', () => App);
AppRegistry.registerComponent('AnotherApp', () => AnotherApp);