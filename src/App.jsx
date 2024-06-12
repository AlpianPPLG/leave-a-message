import { useState, useEffect } from "react";

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [editIndex, setEditIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    const text = "Tiinggalkan Pesan Mu!";
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
      alert("Harap isi pesan sebelum menambahkan!");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      if (editIndex === -1) {
        setTodos([...todos, input]);
      } else {
        const updatedTodos = todos.map((item, index) => {
          if (index === editIndex) {
            return input;
          }
          return item;
        });
        setTodos(updatedTodos);
        setEditIndex(-1);
      }
      setInput("");
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleAddTodo();
    }
  };

  const handleEdit = (index) => {
    setInput(todos[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const filteredTodos = todos.filter((_, idx) => idx !== index);
    setTodos(filteredTodos);
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
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tambahkan pesan..."
              className="bg-white shadow-md border-2 border-gray-300 p-2 rounded mb-4"
            />
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
          </div>
          <ul className="mt-4">
            {todos.map((todo, index) => (
              <li
                key={index}
                className="bg-white shadow-md border-2 border-gray-300 p-2 rounded mb-4 text-gray-900 flex justify-between items-center"
              >
                {todo}
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
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
