import { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import './App.css';

function App() {
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState('');
  const [tempName, setTempName] = useState('');
  
  // --- STATE MỚI ---
  const [onlineCount, setOnlineCount] = useState(0); // Số người online
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  
  // State cho Góp ý
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState('');

  const [message, setMessage] = useState('');
  const chatEndRef = useRef(null);

  const MAX_MSG_LENGTH = 1000;
  const MAX_NAME_LENGTH = 15;

  const formatTime = (dateString) => {
    if (!dateString) return "...";
    const d = new Date(dateString);
    return `[${d.getDate().toString().padStart(2,'0')}:${(d.getMonth()+1).toString().padStart(2,'0')}:${d.getFullYear().toString().slice(-2)} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}]`;
  };

  useEffect(() => {
    const savedName = localStorage.getItem('chatUserName');
    if (savedName) setUser(savedName);
    else setIsNameModalOpen(true);

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5219/chatHub")
      .withAutomaticReconnect()
      .build();
    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log('Connected!');

          // 1. Lắng nghe tin nhắn
          connection.on('ReceiveMessage', (user, message, createdAt) => {
            const newMsg = { user, message, createdAt };
            setMessages(prev => [...prev, newMsg]);
          });

          // 2. Lắng nghe số lượng người Online (MỚI)
          connection.on('UpdateUserCount', (count) => {
            setOnlineCount(count);
          });
        })
        .catch(e => console.log('Connection failed: ', e));
    }
  }, [connection]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSaveName = () => {
    if (tempName.trim() && tempName.length <= MAX_NAME_LENGTH) {
      localStorage.setItem('chatUserName', tempName);
      setUser(tempName);
      setIsNameModalOpen(false);
    } else {
        alert(`Tên hợp lệ và dưới ${MAX_NAME_LENGTH} ký tự!`);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    if (connection && user) {
      try {
        await connection.invoke('SendMessage', user, message);
        setMessage('');
      } catch (e) { console.error(e); }
    }
  };

  // --- HÀM GỬI GÓP Ý (MỚI) ---
  const handleSendFeedback = async () => {
    if (!feedbackContent.trim()) {
        alert("Vui lòng nhập nội dung góp ý!");
        return;
    }
    if (connection) {
        try {
            // Gọi hàm SendFeedback bên C#
            await connection.invoke('SendFeedback', user || 'Ẩn danh', feedbackContent);
            alert("Cảm ơn bạn đã góp ý!");
            setFeedbackContent('');
            setIsFeedbackOpen(false);
        } catch (e) {
            console.error(e);
            alert("Lỗi khi gửi góp ý.");
        }
    }
  };

  return (
    <div className="app-container">
      {/* Modal Nhập Tên */}
      {isNameModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Nhập tên hiển thị</h3>
            <input 
              placeholder="Tên của bạn..."
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' ? handleSaveName() : null}
              maxLength={MAX_NAME_LENGTH}
            />
            <small style={{display: 'block', marginBottom: '10px', color: '#666'}}>
                Tối đa {MAX_NAME_LENGTH} ký tự ({tempName.length}/{MAX_NAME_LENGTH})
            </small>
            <button onClick={handleSaveName}>Xác nhận</button>
          </div>
        </div>
      )}

      {/* --- Modal Góp Ý (MỚI) --- */}
      {isFeedbackOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3>Góp ý cho Admin</h3>
            <textarea
              className="feedback-input"
              rows="5"
              placeholder="Nhập nội dung góp ý của bạn..."
              value={feedbackContent}
              onChange={(e) => setFeedbackContent(e.target.value)}
            ></textarea>
            <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                <button style={{background: '#888'}} onClick={() => setIsFeedbackOpen(false)}>Đóng</button>
                <button onClick={handleSendFeedback}>Gửi Góp Ý</button>
            </div>
          </div>
        </div>
      )}

      {/* Khung Chat Chính */}
      <div className="chat-frame">
        <header className="chat-header">
          <div className="header-left">
             <span>Xin chào, <strong>{user || '...'}</strong></span>
             {/* Hiển thị số người Online */}
             <span className="online-badge">
                🟢 {onlineCount} Online
             </span>
          </div>
          
          <div className="header-right">
             {/* Nút Góp ý */}
             <button className="btn-feedback" onClick={() => setIsFeedbackOpen(true)}>
                Góp ý
             </button>
             <button className="btn-edit" onClick={() => { setTempName(user); setIsNameModalOpen(true); }}>
                Sửa tên
             </button>
          </div>
        </header>

        <div className="messages-area">
          {messages.map((m, index) => (
            <div key={index} className="message-item">
              <span className="msg-time">{formatTime(m.createdAt)}</span>
              <span className="msg-user">{m.user}:</span>
              <span>{m.message}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="input-area">
          <div className="input-wrapper">
             <input 
                className="msg-input"
                placeholder="Nhập tin nhắn..." 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' ? sendMessage() : null}
                maxLength={MAX_MSG_LENGTH}
              />
              <span className={`char-counter ${message.length >= MAX_MSG_LENGTH ? 'limit-reached' : ''}`}>
                 {message.length}/{MAX_MSG_LENGTH}
              </span>
          </div>
          <button className="btn-send" onClick={sendMessage}>Gửi</button>
        </div>
      </div>
    </div>
  );
}

export default App;