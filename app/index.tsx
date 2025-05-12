import { FlatList, StyleSheet, Image, Text, View, TouchableOpacity, TextInput, Keyboard} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Checkbox } from "expo-checkbox";
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

type ToDoType ={
  id: number;
  title: string;
  isDone: boolean;
}

export default function Index() {
  const todoData = [
    {
      id: 1,
      title: "Todo 1",
      isDone: false,
    },
    {
      id: 2,
      title: "Todo 2",
      isDone: true,
    },
    {
      id: 3,
      title: "Todo 3",
      isDone: false,
    }
  ];

  const [todos, setTodos] = useState<ToDoType[]>([]);
  const [newTodo, setNewTodo] = useState<string>("");

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const storedTodos = await AsyncStorage.getItem("my-todo");
        if (storedTodos) {
          setTodos(JSON.parse(storedTodos));
        }
      } catch (error) {
        console.error("Error fetching todos:", error);
      }
    };
    fetchTodos();
  }, []);

  const addTodo = async() => {
    try {
      if (newTodo.trim() === "") return;
      const newTodoItem: ToDoType = {
        id: Math.random(),
        title: newTodo,
        isDone: false,
      };
      todos.push(newTodoItem);
      setTodos(todos);
      await AsyncStorage.setItem("my-todo", JSON.stringify(todos));
      setNewTodo("");
      Keyboard.dismiss();
    }
    catch (error) {
      console.error("Error adding todo:", error);
    }
  };
  
  const deleteTodo = async (id: number) => {
    try {
      const updatedTodos = todos.filter((todo) => todo.id !== id);
      setTodos(updatedTodos);
      await AsyncStorage.setItem("my-todo", JSON.stringify(updatedTodos));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const toggleCheckbox = async (id: number) => {
    try {
      const updatedTodos = todos.map((todo) => {
        if (todo.id === id) {
          todo.isDone = !todo.isDone;
        }
        return todo;
      });
      setTodos(updatedTodos);
      await AsyncStorage.setItem("my-todo", JSON.stringify(updatedTodos));
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { alert('Clicked!') }}>
          <Ionicons name="menu" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { alert('Clicked!') }}>
          <Image source={{ uri: 'https://xsgames.co/randomusers/avatar.php?g=male' }} style={{ width: 40, height: 40, borderRadius: 20 }} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={[...todos].reverse()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => 
          (<ToDoItem todo={item} deleteTodo={deleteTodo} toggleCheckbox={toggleCheckbox} /> )}
      />

      <View style={styles.footer}>
        <TextInput 
          placeholder="Add New Task" 
          value={newTodo}  
          onChangeText={(text) => setNewTodo(text)}
          style={styles.newTodoInput} 
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => addTodo()}>
          <Ionicons name="add" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const ToDoItem = ({ todo, deleteTodo, toggleCheckbox }: 
                  { todo: ToDoType, deleteTodo: (id:number) => void, toggleCheckbox: (id:number) => void }) => 
{

  return (
    <View style={styles.todoContainer}>
      <View style={styles.todoInfoContainer}>
        <Checkbox 
          value={todo.isDone} 
          color={todo.isDone ? "green" : undefined}  
          onValueChange={() => toggleCheckbox(todo.id)}
        />
        <Text style=
          {[
            styles.todoText, todo.isDone && { textDecorationLine: 'line-through' }
          ]}>
          {todo.title}
        </Text>
      </View>
      <TouchableOpacity onPress={() => deleteTodo(todo.id)}>
        <Ionicons name="trash" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  todoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  todoInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  todoText: {
    fontSize: 16,
    color: "#333",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  newTodoInput: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

