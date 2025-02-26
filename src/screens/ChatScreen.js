import { useState, useEffect } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { db, functions } from "../../firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setChats } from "../redux/actions";
import Animated, { FadeIn } from "react-native-reanimated";

const companions = [
  { id: "sophie", name: "Sophie", personality: "Witty" },
  // Add 9 more companions here
];

export default function ChatScreen() {
  const [message, setMessage] = useState("");
  const [selectedCompanion, setSelectedCompanion] = useState(companions[0]);
  const chats = useSelector((state) => state.app.chats);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "chats"), (snapshot) => {
      const chatData = {};
      snapshot.forEach((doc) => {
        chatData[doc.id] = doc.data();
      });
      dispatch(setChats(chatData));
      AsyncStorage.setItem("chats", JSON.stringify(chatData));
    });
    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!message) return;
    try {
      // Save user message to Firestore
      await addDoc(collection(db, "chats"), {
        userId: "user1", // Replace with real user ID from auth
        companionId: selectedCompanion.id,
        text: message,
        timestamp: new Date().toISOString(),
      });

      // Call the callable Cloud Function for AI reply
      const getAIResponse = httpsCallable(functions, "getAIResponse");
      const result = await getAIResponse({ message });

      if (result.data.reply) {
        // Save AI reply to Firestore
        await addDoc(collection(db, "chats"), {
          userId: selectedCompanion.id,
          companionId: selectedCompanion.id,
          text: result.data.reply,
          timestamp: new Date().toISOString(),
        });
      } else {
        console.log("Error from Cloud Function:", result.data.error);
      }

      setMessage("");
    } catch (error) {
      console.log("Error sending message:", error);
    }
  };

  return (
    <View className="flex-1 bg-background p-4">
      <FlatList
        data={Object.values(chats)}
        renderItem={({ item }) => (
          <Animated.View entering={FadeIn}>
            <Text className="text-text p-2 bg-secondary rounded-lg my-1">
              {item.text}
            </Text>
          </Animated.View>
        )}
        keyExtractor={(item) => item.timestamp}
      />
      <View className="flex-row items-center mt-2">
        <TextInput
          className="flex-1 bg-white p-2 rounded-lg text-text"
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          style={{ fontFamily: "Poppins" }}
        />
        <TouchableOpacity onPress={sendMessage} className="ml-2 bg-primary p-2 rounded-lg">
          <Text className="text-white">Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}