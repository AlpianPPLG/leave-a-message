import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("General");
  const [editIndex, setEditIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [lastUpdated, setLastUpdated] = useState(-1);
  const [maxLength] = useState(200); // Batas maksimal karakter
  const [remainingChars, setRemainingChars] = useState(maxLength);

  useEffect(() => {
    const storedTodos = JSON.parse(localStorage.getItem("todos"));
    if (storedTodos) setTodos(storedTodos);
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    const text = "Tinggalkan Pesan Mu!";
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
        message: input,
        category,
        timestamp: new Date().toLocaleString(),
      };

      if (editIndex === -1) {
        setTodos([newTodo, ...todos]);
        setLastUpdated(0);
        Swal.fire("Berhasil!", "Pesan berhasil ditambahkan!", "success");
      } else {
        const updatedTodos = todos.map((item, index) => {
          if (index === editIndex) {
            setLastUpdated(index);
            return { ...item, message: input, category };
          }
          return item;
        });
        setTodos(updatedTodos);
        setEditIndex(-1);
        Swal.fire("Berhasil!", "Pesan berhasil diperbarui!", "success");
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
        Swal.fire("Dihapus!", "Pesan berhasil dihapus.", "success");
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

  return (
    <div className="bg-gray-60 center-text">
      <div className="p-8 md:p-10 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-lg text-center">
          <h2
            className="text-2xl font-bold text-gray-900 md:text-3xl mt-10"
            onClick={() => window.location.reload()}
          >
            {typedText}
          </h2>
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
            <div className="mt-2 text-gray-500">
              {remainingChars} karakter tersisa
            </div>
          </div>
          <ul className="mt-4">
            {todos.map((todo, index) => (
              <motion.li
                key={index}
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
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
