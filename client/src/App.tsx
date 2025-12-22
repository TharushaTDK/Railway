import { useEffect, useState } from "react";

// Configure API base URL for Production vs Development
// In Dev, Vite proxies /api to localhost:8080
// In Prod, we can use relative path (if same domain) or absolute URL via env var
const API_BASE = import.meta.env.DEV
  ? "/api"
  : (import.meta.env.VITE_API_URL || "/api");

type Todo = { id: number; title: string; completed: boolean; created_at: string };
type Contact = { id: number; name: string; email: string; created_at: string };

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<string>("Loading...");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((r) => r.json())
      .then((h) => setStatus(`Backend: OK (${h.env})`))
      .catch(() => setStatus("Backend unreachable"));
    loadTodos();
    loadContacts();
  }, []);

  const loadTodos = async () => {
    try {
      const r = await fetch(`${API_BASE}/todos`);
      if (!r.ok) {
        const err = await r.json();
        setStatus(err.error || "Error");
        return;
      }
      const data: Todo[] = await r.json();
      setTodos(data);
    } catch {
      setStatus("Failed to load todos");
    }
  };

  const loadContacts = async () => {
    try {
      const r = await fetch(`${API_BASE}/contacts`);
      if (!r.ok) return;
      const data: Contact[] = await r.json();
      setContacts(data);
    } catch {}
  };

  const addTodo = async () => {
    if (!title.trim()) return;
    const r = await fetch(`${API_BASE}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (r.ok) {
      setTitle("");
      loadTodos();
    } else {
      const err = await r.json();
      alert(err.error || "Failed to add");
    }
  };

  const toggleTodo = async (id: number, completed: boolean) => {
    const r = await fetch(`${API_BASE}/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });
    if (r.ok) loadTodos();
  };

  const deleteTodo = async (id: number) => {
    const r = await fetch(`${API_BASE}/todos/${id}`, { method: "DELETE" });
    if (r.ok) loadTodos();
  };

  return (
    <div style={{ maxWidth: 720, margin: "2rem auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>Railway Node TypeScript + Postgres</h1>
      <p>{status}</p>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          placeholder="New todo title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button onClick={addTodo} style={{ padding: "0.5rem 1rem" }}>
          Add
        </button>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((t) => (
          <li key={t.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0" }}>
            <input type="checkbox" checked={t.completed} onChange={() => toggleTodo(t.id, t.completed)} />
            <span style={{ textDecoration: t.completed ? "line-through" : "none" }}>{t.title}</span>
            <span style={{ marginLeft: "auto", color: "#666", fontSize: 12 }}>
              {new Date(t.created_at).toLocaleString()}
            </span>
            <button onClick={() => deleteTodo(t.id)} style={{ marginLeft: "0.5rem" }}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      <hr style={{ margin: "2rem 0" }} />
      <h2>Contacts</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "0.5rem", alignItems: "center" }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "0.5rem" }}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "0.5rem" }}
        />
        <button
          onClick={async () => {
            if (!name.trim() || !email.trim()) return;
            const r = await fetch(`${API_BASE}/contacts`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, email }),
            });
            if (r.ok) {
              setName("");
              setEmail("");
              loadContacts();
            } else {
              alert("Failed to save contact");
            }
          }}
          style={{ padding: "0.5rem 1rem" }}
        >
          Save
        </button>
      </div>
      <table style={{ width: "100%", marginTop: "1rem", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>Name</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>Email</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>Created</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c) => (
            <tr key={c.id}>
              <td style={{ padding: "0.5rem" }}>{c.name}</td>
              <td style={{ padding: "0.5rem" }}>{c.email}</td>
              <td style={{ padding: "0.5rem" }}>{new Date(c.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
