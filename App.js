import * as Font from "expo-font";
import AppLoading from "expo-app-loading";
import { useState } from "react";
import { Provider } from "react-redux";
import store from "./src/redux/store";
import Navigation from "./src/navigation";

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = async () => {
    await Font.loadAsync({
      Poppins: require("./assets/fonts/Poppins-Regular.ttf"),
    });
  };

  if (!fontsLoaded) {
    return (
      <AppLoading
        startAsync={loadFonts}
        onFinish={() => setFontsLoaded(true)}
        onError={console.warn}
      />
    );
  }

  return (
    <Provider store={store}>
      <Navigation />
    </Provider>
  );
}