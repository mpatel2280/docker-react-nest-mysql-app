import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../services/api';
import type { User } from '../services/api';

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchUsers = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await userApi.getAll({ page: pageNum, limit });
      setUsers(response.data);
      setTotal(response.meta.total);
      setTotalPages(Math.ceil(response.meta.total / limit));
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = async (id: number) => {
    if (globalThis.confirm('Are you sure you want to delete this user?')) {
      try {
        await userApi.delete(id);
        setUsers(users.filter((user) => user.id !== id));
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  if (loading && users.length === 0) return <div className="loading">Loading...</div>;
  if (error && users.length === 0) return <div className="error">{error}</div>;

  return (
    <div className="user-list">
      <div className="header">
        <h2>Users</h2>
        <Link to="/users/add" className="btn btn-primary">
          Add User
        </Link>
      </div>
      {error && users.length > 0 && <div className="error">{error}</div>}
      {users.length === 0 && !loading ? (
        <p>No users found.</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name || '-'}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/users/edit/${user.id}`} className="btn btn-edit">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="btn btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="pagination">
            <div className="pagination-info">
              Showing {users.length > 0 ? (page - 1) * limit + 1 : 0} to{' '}
              {Math.min(page * limit, total)} of {total} users
            </div>
            <div className="pagination-controls">
              <button
                onClick={() => handlePageChange(1)}
                disabled={page === 1}
                className="btn btn-pagination"
                title="First page"
              >
                ««
              </button>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="btn btn-pagination"
                title="Previous page"
              >
                «
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((pageNum) => {
                  // Show first page, last page, current page, and 2 pages around current
                  return (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - page) <= 2
                  );
                })
                .map((pageNum, index, array) => {
                  // Add ellipsis if there's a gap
                  const prevPageNum = array[index - 1];
                  const showEllipsis = prevPageNum && pageNum - prevPageNum > 1;

                  return (
                    <span key={pageNum}>
                      {showEllipsis && <span className="pagination-ellipsis">...</span>}
                      <button
                        onClick={() => handlePageChange(pageNum)}
                        className={`btn btn-pagination ${page === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    </span>
                  );
                })}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="btn btn-pagination"
                title="Next page"
              >
                »
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={page === totalPages}
                className="btn btn-pagination"
                title="Last page"
              >
                »»
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

