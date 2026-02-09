import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

const Footer = () => {
    return (
        <div className="react-footer" style={{
            marginTop: '50px',
            padding: '20px',
            borderTop: '1px solid #dee2e6',
            textAlign: 'center',
            color: '#6c757d',
            backgroundColor: '#f8f9fa'
        }}>
            <p style={{ margin: '0', fontWeight: '500' }}>
                © 2026 Task4. Все права не защищены.
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>
                Разработано: <strong>Кирчук Александр</strong>
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem' }}>
                Fullstack Developer | React | Node.js
            </p>
        </div>
    );
};

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user');
      if (!res.ok) throw new Error('Ошибка загрузки');
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };
  
  const deleteUsers = async () => {
    if (!confirm('Удалить выбранных?')) return;
    
    try {
        const res = await fetch('/api/user', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: selectedIds })
        });

        if (!res.ok) throw new Error('Ошибка удаления');

        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const myId = currentUser.id;

        const isDeleted = selectedIds.map(String).includes(String(myId));

        if (isDeleted) {
            localStorage.clear();
            window.location.href = '/';
        } else {
            fetchUsers();
            setSelectedIds([]);
        }
    } catch (error) {
        console.error(error);
        alert('Не удалось удалить пользователей');
    }
  };

  const updateStatus = async (status) => {
    try {
        const res = await fetch('/api/user', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: selectedIds, status })
        });

        if (!res.ok) throw new Error('Ошибка обновления статуса');

        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const myId = currentUser.id;
        const isBlocked = status === 'blocked' && selectedIds.map(String).includes(String(myId));

        if (isBlocked) {
            localStorage.clear();
            window.location.href = '/';
        } else {
            fetchUsers();
            setSelectedIds([]);
        }
    } catch (error) {
        console.error(error);
        alert('Не удалось обновить статус');
    }
  };

  const deleteUnverified = async () => {
    if (!confirm('Удалить всех неподтвержденных?')) return;
    await fetch('/api/user/unverified', { method: 'DELETE' });
    fetchUsers();
  };

  const getStatusBadge = (status) => {
    if (status === 'active') return 'bg-success';
    if (status === 'blocked') return 'bg-danger';
    return 'bg-secondary';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleDateString('ru-RU') + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === users.length && users.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map(u => u.id));
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0 text-muted">Управление пользователями</h5>
        <span className="badge bg-secondary">Всего: {users.length}</span>
      </div>

      <div className="toolbar">
        <button 
          className="btn btn-outline-danger" 
          disabled={selectedIds.length === 0}
          onClick={() => updateStatus('blocked')}
        >
          Заблокировать
        </button>
        <button 
          className="btn btn-outline-secondary" 
          disabled={selectedIds.length === 0}
          onClick={() => updateStatus('active')}
        >
           <i className="fa fa-unlock-alt"></i> Разблокировать
        </button>
        <button 
          className="btn btn-outline-danger" 
          disabled={selectedIds.length === 0}
          onClick={deleteUsers}
        >
          <i className="fa fa-trash"></i> Удалить
        </button>
        <button 
          className="btn btn-outline-warning" 
          onClick={deleteUnverified}
        >
          <i className="fa fa-user-slash"></i> Очистить неподтвержденных
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="text-center p-4">Загрузка...</div>
        ) : users.length === 0 ? (
          <div className="text-center p-4">Нет данных</div>
        ) : (
          <table className="table table-hover table-striped mb-0">
            <thead>
              <tr>
                <th className="text-center">
                  <input 
                    type="checkbox" 
                    className="form-check-input"
                    checked={selectedIds.length === users.length && users.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Имя</th>
                <th>Email</th>
                <th>Статус</th>
                <th>Регистрация</th>
                <th className="text-end">Последний вход</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="text-center">
                    <input 
                      type="checkbox" 
                      className="form-check-input"
                      checked={selectedIds.includes(u.id)}
                      onChange={() => toggleSelect(u.id)}
                    />
                  </td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(u.status)}`}>
                      {u.status === 'unverified' ? 'Unverified' : u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                    </span>
                  </td>
                  <td>{formatDate(u.registered_at)}</td>
                  <td className="text-end text-nowrap">{formatDate(u.last_login)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Footer />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('react-dashboard-root'));
root.render(<Dashboard />);