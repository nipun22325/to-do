import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Image, Text, View, TouchableOpacity, TextInput, Keyboard, LayoutAnimation, Platform, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Checkbox } from "expo-checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";


type ToDoType = {
  id: number;
  title: string;
  isDone: boolean;
  completedAt?: string;
};

export default function Index() {
  const [todos, setTodos] = useState<ToDoType[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const colors = {
    background: isDark ? "#121212" : "#f2f2f2",
    card: isDark ? "#1e1e1e" : "#fff",
    text: isDark ? "#fff" : "#333",
    subtext: isDark ? "#ccc" : "#666",
    inputBg: isDark ? "#2a2a2a" : "#f0f0f0",
    border: isDark ? "#333" : "#ccc",
    accent: "#4caf50",
    danger: "#e53935",
  };

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem("my-todo");
      if (raw) setTodos(JSON.parse(raw));
    })();
  }, []);

  const persist = async (next: ToDoType[]) => {
    setTodos(next);
    await AsyncStorage.setItem("my-todo", JSON.stringify(next));
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    const next = [
      ...todos,
      {
        id: Date.now(),
        title: newTodo.trim(),
        isDone: false,
      } as ToDoType,
    ];
    await persist(next);
    setNewTodo("");
    Keyboard.dismiss();
  };

  const deleteTodo = async (id: number) => {
    await persist(todos.filter((t) => t.id !== id));
  };

  const toggleCheckbox = async (id: number) => {
    const next = todos.map((t) =>
      t.id === id
        ? {
          ...t,
          isDone: !t.isDone,
          completedAt: !t.isDone ? new Date().toISOString() : undefined,
        }
        : t
    );
    await persist(next);
  };

  // split pending vs completed
  const pending = todos.filter((t) => !t.isDone);
  const completed = todos
    .filter((t) => t.isDone)
    .sort(
      (a, b) =>
        new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
    );

  const toggleCompletedSection = () => {
    if (Platform.OS === "android") {
      LayoutAnimation.configureNext(
        LayoutAnimation.Presets.easeInEaseOut
      );
    }
    setShowCompleted((v) => !v);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name="menu"
          size={24}
          color={colors.text}
        />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Tasks
        </Text>
        <Image
          source={{
            uri: "https://xsgames.co/randomusers/avatar.php?g=male",
          }}
          style={styles.avatar}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={styles.tabActive}>
          <Text
            style={[
              styles.tabTextActive,
              { color: colors.text },
            ]}
          >
            My Tasks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text
            style={[styles.tabText, { color: colors.subtext }]}
          >
            + New list
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {pending.length === 0 ? (
          <View style={styles.emptyState}>
            <Text
              style={[
                styles.emptyTitle,
                { color: colors.text },
              ]}
            >
              All tasks completed
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                { color: colors.subtext },
              ]}
            >
              Nice work!
            </Text>
          </View>
        ) : (
          <FlatList
            data={[...pending].reverse()}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ToDoItem
                todo={item}
                colors={colors}
                deleteTodo={deleteTodo}
                toggleCheckbox={toggleCheckbox}
              />
            )}
            ListHeaderComponent={
              <Text
                style={[
                  styles.sectionHeader,
                  { color: colors.text },
                ]}
              >
                My Tasks
              </Text>
            }
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        )}

        {/* Completed Section */}
        <TouchableOpacity
          style={styles.completedHeader}
          onPress={toggleCompletedSection}
        >
          <Text
            style={[
              styles.sectionHeader,
              { color: colors.text },
            ]}
          >
            Completed ({completed.length})
          </Text>
          <Ionicons
            name={showCompleted ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.subtext}
          />
        </TouchableOpacity>

        {showCompleted && completed.length > 0 && (
          <FlatList
            data={completed}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.todoContainer,
                  { backgroundColor: colors.card },
                ]}
              >
                <View style={styles.todoInfoContainer}>
                  <Checkbox
                    value={item.isDone}
                    color={colors.accent}
                    onValueChange={() => toggleCheckbox(item.id)}
                  />
                  <View style={{ marginLeft: 8 }}>
                    <Text
                      style={[
                        styles.todoText,
                        styles.completedText,
                        { color: colors.subtext },
                      ]}
                    >
                      {item.title}
                    </Text>
                    {item.completedAt && (
                      <Text
                        style={[
                          styles.completedDate,
                          { color: colors.subtext },
                        ]}
                      >
                        Completed:{" "}
                        {format(
                          new Date(item.completedAt),
                          "EEE, d MMM"
                        )}
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => deleteTodo(item.id)}
                >
                  <Ionicons
                    name="trash"
                    size={20}
                    color={colors.danger}
                  />
                </TouchableOpacity>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        )}
      </View>

      {/* Footer / New Todo */}
      <View
        style={[
          styles.footer,
          { backgroundColor: colors.card },
        ]}
      >
        <TextInput
          style={[
            styles.newTodoInput,
            { backgroundColor: colors.inputBg, color: colors.text },
          ]}
          placeholder="Add new task"
          placeholderTextColor={colors.subtext}
          value={newTodo}
          onChangeText={setNewTodo}
        />
        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: colors.text },
          ]}
          onPress={addTodo}
        >
          <Ionicons name="add" size={24} color={colors.card} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const ToDoItem = ({
  todo,
  deleteTodo,
  toggleCheckbox,
  colors,
}: {
  todo: ToDoType;
  deleteTodo: (id: number) => void;
  toggleCheckbox: (id: number) => void;
  colors: ReturnType<Index["colors"]>;
}) => (
  <View
    style={[
      styles.todoContainer,
      { backgroundColor: colors.card },
    ]}
  >
    <View style={styles.todoInfoContainer}>
      <Checkbox
        value={todo.isDone}
        color={colors.accent}
        onValueChange={() => toggleCheckbox(todo.id)}
      />
      <Text
        style={[
          styles.todoText,
          todo.isDone && styles.completedText,
          { color: colors.text },
        ]}
      >
        {todo.title}
      </Text>
    </View>
    <TouchableOpacity onPress={() => deleteTodo(todo.id)}>
      <Ionicons name="trash" size={20} color={colors.danger} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 20, fontWeight: "600" },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  tabs: { flexDirection: "row", paddingHorizontal: 16 },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 16,
  },
  tabActive: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
  },
  tabText: { fontSize: 16 },
  tabTextActive: { fontSize: 16, fontWeight: "600" },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  completedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  todoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  todoInfoContainer: { flexDirection: "row", gap: 10, alignItems: "center" },
  todoText: { fontSize: 16 },
  completedText: {
    textDecorationLine: "line-through",
  },
  completedDate: { fontSize: 12, marginTop: 2 },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyImage: { width: 180, height: 180, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "600", marginBottom: 4 },
  emptySubtitle: { fontSize: 14 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  newTodoInput: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  addButton: {
    padding: 12,
    borderRadius: 8,
  },
});
