import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid"; // Importing uuid for unique IDs
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("General");
  const [editIndex, setEditIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [lastUpdated, setLastUpdated] = useState(-1);
  const [maxLength] = useState(200);
  const [remainingChars, setRemainingChars] = useState(maxLength);
  const [darkMode, setDarkMode] = useState(false);
  const [sortByTime, setSortByTime] = useState("desc");
  const [expirationTime, setExpirationTime] = useState(5); // Initialize expiration time to 5 minutes

  useEffect(() => {
    const storedTodos = JSON.parse(localStorage.getItem("todos"));
    if (storedTodos) {
      const validTodos = storedTodos.filter((todo) => {
        return new Date().getTime() < todo.expirationTime; // Check for expiration
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
        id: uuidv4(), // Unique ID for each todo
        message: input,
        category,
        timestamp: new Date().toLocaleString(),
        expirationTime: new Date().getTime() + expirationTime * 60000, // Set expiration time
      };

      if (editIndex === -1) {
        setTodos([newTodo, ...todos]);
        setLastUpdated(0);
        toast.success("Pesan berhasil ditambahkan!");
      } else {
        const updatedTodos = todos.map((item, index) => {
          if (index === editIndex) {
            setLastUpdated(index);
            return {
              ...item,
              message: input,
              category,
              expirationTime: new Date().getTime() + expirationTime * 60000,
            }; // Update expiration time
          }
          return item;
        });
        setTodos(updatedTodos);
        setEditIndex(-1);
        toast.success("Pesan berhasil diperbarui!");
      }
      setInput("");
      setCategory("General");
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleAddTodo();
    }
  };

  const handleEdit = (index) => {
    setInput(todos[index].message);
    setCategory(todos[index].category);
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
          <div className="mt-4">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Tambahkan pesan..."
              className="bg-white shadow-md border-2 border-gray-300 p-2 rounded mb-4"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-white shadow-md border-2 border-gray-300 p-2 rounded mb-4 ml-2"
            >
              <option value="General">General</option>
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Others">Others</option>
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
                  {todos.map((todo, index) => (
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
                          className={`bg-white shadow-md border-2 border-gray-300 p-2 rounded mb-4 text-gray-900 flex justify-between items-center ${
                            lastUpdated === index ? "bg-green-100" : ""
                          }`}
                        >
                          <div>
                            <p>{todo.message}</p>
                            <p className="text-xs text-gray-500">
                              Kategori: {todo.category}
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
