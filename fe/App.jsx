import { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import './App.css'; // Bạn có thể tự style sau

function App() {
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // 1. Khởi tạo kết nối tới Hub
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5219/chatHub") // URL của Backend
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      // 2. Bắt đầu kết nối
      connection.start()
        .then(() => {
          console.log('Connected to SignalR Hub');
          
          // 3. Lắng nghe sự kiện "ReceiveMessage" từ Server
          connection.on('ReceiveMessage', (user, message) => {
            const newMsg = { user, message };
            setMessages(prev => [...prev, newMsg]);
          });
        })
        .catch(e => console.log('Connection failed: ', e));
    }
  }, [connection]);

  const sendMessage = async () => {
    if (connection && user && message) {
      try {
        // 4. Gửi tin nhắn lên Server (gọi hàm SendMessage bên C#)
        await connection.invoke('SendMessage', user, message);
        setMessage(''); // Xóa ô nhập liệu sau khi gửi
      } catch (e) {
        console.error(e);
      }
    } else {
        alert("Vui lòng nhập tên và tin nhắn!");
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Chat Room (.NET + React)</h2>
      
      {/* Khu vực hiển thị tin nhắn */}
      <div style={{ border: '1px solid #ccc', height: '300px', overflowY: 'scroll', padding: '10px', marginBottom: '10px' }}>
        {messages.map((m, index) => (
          <div key={index} style={{ marginBottom: '5px' }}>
            <strong>{m.user}:</strong> {m.message}
          </div>
        ))}
      </div>

      {/* Khu vực nhập liệu */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          placeholder="Tên bạn..." 
          value={user} 
          onChange={e => setUser(e.target.value)} 
          style={{ width: '100px' }}
        />
        <input 
          placeholder="Nhập tin nhắn..." 
          value={message} 
          onChange={e => setMessage(e.target.value)} 
          style={{ flex: 1 }}
          onKeyDown={e => e.key === 'Enter' ? sendMessage() : null}
        />
        <button onClick={sendMessage}>Gửi</button>
      </div>
    </div>
  );
}

export default App;