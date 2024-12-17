import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import "react-toastify/dist/ReactToastify.css";
import EmojiPicker from "emoji-picker-react";

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [subtaskInput, setSubtaskInput] = useState(""); // Input untuk subtugas
  const [category, setCategory] = useState("General");
  const [tags, setTags] = useState("");
  const [editIndex, setEditIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [maxLength] = useState(200);
  const [remainingChars, setRemainingChars] = useState(maxLength);
  const [darkMode, setDarkMode] = useState(false);
  const [sortByTime, setSortByTime] = useState("desc");
  const [expirationTime, setExpirationTime] = useState(5);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [priority, setPriority] = useState("Low");

  const categories = ["All", "General", "Personal", "Work", "Others"];
  const priorities = ["Low", "Medium", "High"];

  useEffect(() => {
    const storedTodos = JSON.parse(localStorage.getItem("todos"));
    if (storedTodos) {
      const validTodos = storedTodos.filter((todo) => {
        return new Date().getTime() < todo.expirationTime;
      });
      setTodos(validTodos);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    const text = "iTinggalkan Pesan Mu!";
    let index = 0;
    const interval = setInterval(() => {
      setTypedText((prevText) => prevText + text.charAt(index));
      index++;
      if (index === text.length) {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleAddTodo = () => {
    if (!input.trim()) {
      Swal.fire("Oops!", "Harap isi pesan sebelum menambahkan!", "warning");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const newTodo = {
        id: uuidv4(),
        message: input,
        category,
        tags: tags.split(",").map((tag) => tag.trim()),
        priority,
        subtasks: [], // Menyimpan subtugas
        timestamp: new Date().toLocaleString(),
        expirationTime: new Date().getTime() + expirationTime * 60000,
      };

      if (editIndex === -1) {
        setTodos([newTodo, ...todos]);
        toast.success("Pesan berhasil ditambahkan!");
      } else {
        const updatedTodos = todos.map((item, index) => {
          if (index === editIndex) {
            return {
              ...item,
              message: input,
              category,
              tags: tags.split(",").map((tag) => tag.trim()),
              priority,
              expirationTime: new Date().getTime() + expirationTime * 60000,
            };
          }
          return item;
        });
        setTodos(updatedTodos);
        setEditIndex(-1);
        toast.success("Pesan berhasil diperbarui!");
      }
      setInput("");
      setTags("");
      setIsLoading(false);
      setShowEmojiPicker(false);
    }, 1000);
  };

  const handleAddSubtask = (todoIndex) => {
    if (!subtaskInput.trim()) {
      Swal.fire("Oops!", "Harap isi subtugas sebelum menambahkan!", "warning");
      return;
    }
    const updatedTodos = todos.map((item, index) => {
      if (index === todoIndex) {
        return {
          ...item,
          subtasks: [
            ...item.subtasks,
            { id: uuidv4(), message: subtaskInput, completed: false },
          ],
        };
      }
      return item;
    });
    setTodos(updatedTodos);
    setSubtaskInput("");
    toast.success("Subtugas berhasil ditambahkan!");
  };

  const handleToggleSubtask = (todoIndex, subtaskIndex) => {
    const updatedTodos = todos.map((item, index) => {
      if (index === todoIndex) {
        const updatedSubtasks = item.subtasks.map((subtask, sIndex) => {
          if (sIndex === subtaskIndex) {
            return { ...subtask, completed: !subtask.completed };
          }
          return subtask;
        });
        return { ...item, subtasks: updatedSubtasks };
      }
      return item;
    });
    setTodos(updatedTodos);
  };

  const handleDeleteSubtask = (todoIndex, subtaskIndex) => {
    const updatedTodos = todos.map((item, index) => {
      if (index === todoIndex) {
        const filteredSubtasks = item.subtasks.filter(
          (_, sIndex) => sIndex !== subtaskIndex
        );
        return { ...item, subtasks: filteredSubtasks };
      }
      return item;
    });
    setTodos(updatedTodos);
    toast.error("Subtugas berhasil dihapus.");
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleAddTodo();
    }
  };

  const handleEdit = (index) => {
    setInput(todos[index].message);
    setCategory(todos[index].category);
    setTags(todos[index].tags.join(", "));
    setPriority(todos[index].priority);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    Swal.fire({
      title: "Apakah kamu yakin?",
      text: "Pesan ini akan dihapus!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        const filteredTodos = todos.filter((_, idx) => idx !== index);
        setTodos(filteredTodos);
        toast.error("Pesan berhasil dihapus.");
      }
    });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setInput(value);
      setRemainingChars(maxLength - value.length);
    }
  };

  const handleTagsChange = (e) => {
    setTags(e.target.value);
  };

  const handleExpirationTimeChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setExpirationTime(value);
    }
  };

  const handleSort = () => {
    const sortedTodos = [...todos].sort((a, b) =>
      sortByTime === "desc"
        ? new Date(b.timestamp) - new Date(a.timestamp)
        : new Date(a.timestamp) - new Date(b.timestamp)
    );
    setTodos(sortedTodos);
    setSortByTime(sortByTime === "desc" ? "asc" : "desc");
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTodos(items);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(todos);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "todos.json";
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = () => {
    const inputElement = document.createElement("input");
    inputElement.type = "file";
    inputElement.accept = ".json";
    inputElement.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        const data = JSON.parse(reader.result);
        setTodos(data);
        toast.success("Pesan berhasil diimpor!");
      };
      reader.onerror = () => {
        toast.error("Terjadi kesalahan saat mengimpor pesan!");
      };
    };
    inputElement.click();
  };

  const handleEmojiClick = (emojiObject) => {
    setInput((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const filteredTodos = todos.filter((todo) => {
    const matchesCategory =
      selectedCategory === "All" || todo.category === selectedCategory;
    const matchesSearch = todo.message
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedTodos = filteredTodos.sort((a, b) => {
    const priorityOrder = { Low: 1, Medium: 2, High: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div
      className={`${
        darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"
      } min-h-screen`}
    >
      <div className="p-8 md:p-10 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-lg text-center">
          <h2
            className="text-2xl font-bold md:text-3xl mt-10 cursor-pointer"
            onClick={() => window.location.reload()}
          >
            {typedText}
          </h2>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <div className="mt-4 relative">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Tambahkan pesan..."
              className="bg-white shadow-md border-2 border-gray-300 p-2 rounded mb-4"
            />
            <button
              className="absolute top-1 right-1"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              😊
            </button>
            {showEmojiPicker && (
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                className="absolute z-10"
              />
            )}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-white shadow-md border-2 border-gray-300 p-2 rounded mb-4 ml-2"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={tags}
              onChange={handleTagsChange}
              placeholder="Tambah tag, pisahkan dengan koma"
              className="bg-white shadow-md border-2 border-gray-300 p-2 rounded mb-4 ml-2"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="bg-white shadow-md border-2 border-gray-300 p-2 rounded mb-4 ml-2"
            >
              {priorities.map((prio) => (
                <option key={prio} value={prio}>
                  {prio}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddTodo}
              className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={isLoading}
            >
              {isLoading
                ? "Loading..."
                : editIndex === -1
                ? "Tambah"
                : "Update"}
            </button>
            <button
              onClick={handleSort}
              className="ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              {sortByTime === "desc" ? "Sort Asc" : "Sort Desc"}
            </button>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white shadow-md border-2 border-gray-300 p-2 rounded mb-4 ml-2"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari pesan..."
              className="bg-white shadow-md border-2 border-gray-300 p-2 rounded mb-4 ml-2"
            />
            <div className="mt-2 text-gray-500">
              Batas waktu kedaluwarsa: {expirationTime} menit
            </div>
            <input
              type="number"
              value={expirationTime}
              onChange={handleExpirationTimeChange}
              className="bg-white shadow-md border-2 border-gray-300 p-2 rounded mb-4 ml-2"
            />
            <button
              onClick={handleExport}
              className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Export
            </button>
            <button
              onClick={handleImport}
              className="ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Import
            </button>
            <div className="mt-2 text-gray-500">
              {remainingChars} karakter tersisa
            </div>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="todos">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="mt-4"
                >
                  {sortedTodos.map((todo, index) => (
                    <Draggable
                      key={todo.id}
                      draggableId={todo.id}
                      index={index}
                    >
                      {(provided) => (
                        <motion.li
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.5 }}
                          className={`bg-white shadow-md border-2 border-gray-300 p-2 rounded mb-4 text-gray-900 flex flex-col`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p>{todo.message}</p>
                              <p className="text-xs text-gray-500">
                                Kategori: {todo.category}
                              </p>
                              <p className="text-xs text-gray-500">
                                Tags: {todo.tags.join(", ")}
                              </p>
                              <p className="text-xs text-gray-500">
                                Prioritas: {todo.priority}
                              </p>
                              <p className="text-xs text-gray-500">
                                Dibuat pada: {todo.timestamp}
                              </p>
                              <p className="text-xs text-red-500">
                                Kedaluwarsa pada:{" "}
                                {new Date(todo.expirationTime).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <button
                                onClick={() => handleEdit(index)}
                                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded"
                                disabled={isLoading}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(index)}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2"
                                disabled={isLoading}
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                          <div className="mt-2">
                            <input
                              type="text"
                              value={subtaskInput}
                              onChange={(e) => setSubtaskInput(e.target.value)}
                              placeholder="Tambahkan subtugas..."
                              className="bg-gray-100 border-2 border-gray-300 p-1 rounded mb-2 w-full"
                            />
                            <button
                              onClick={() => handleAddSubtask(index)}
                              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                            >
                              Tambah Subtugas
                            </button>
                          </div>
                          <ul className="mt-2">
                            {todo.subtasks.map((subtask, sIndex) => (
                              <li
                                key={subtask.id}
                                className="flex items-center mb-1"
                              >
                                <input
                                  type="checkbox"
                                  checked={subtask.completed}
                                  onChange={() =>
                                    handleToggleSubtask(index, sIndex)
                                  }
                                  className="mr-2"
                                />
                                <span
                                  className={
                                    subtask.completed ? "line-through" : ""
                                  }
                                >
                                  {subtask.message}
                                </span>
                                <button
                                  onClick={() =>
                                    handleDeleteSubtask(index, sIndex)
                                  }
                                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2"
                                >
                                  Hapus
                                </button>
                              </li>
                            ))}
                          </ul>
                        </motion.li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;
