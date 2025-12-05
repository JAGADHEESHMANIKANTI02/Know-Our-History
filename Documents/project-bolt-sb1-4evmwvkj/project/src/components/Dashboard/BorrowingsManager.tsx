import { useState, useEffect } from 'react';
import { Plus, X, RotateCcw } from 'lucide-react';
import { borrowingsApi, booksApi, usersApi } from '../../lib/api';
import { Borrowing, Book, Profile } from '../../types';

export const BorrowingsManager = () => {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    book_id: '',
    user_id: '',
    due_days: 14,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [borrowingsData, booksData, usersData] = await Promise.all([
        borrowingsApi.getAll(),
        booksApi.getAll({ available: false }),
        usersApi.getAll(),
      ]);
      setBorrowings(borrowingsData);
      setBooks(booksData);
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await borrowingsApi.borrow({
        book_id: formData.book_id,
        user_id: formData.user_id,
        due_days: formData.due_days,
      });
      setShowForm(false);
      setFormData({ book_id: '', user_id: '', due_days: 14 });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to borrow book');
    }
  };

  const handleReturn = async (borrowingId: string) => {
    if (!confirm('Are you sure you want to return this book?')) return;

    try {
      await borrowingsApi.return(borrowingId);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to return book');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ book_id: '', user_id: '', due_days: 14 });
    setError('');
  };

  if (loading) {
    return <div className="text-center py-8">Loading borrowings...</div>;
  }

  const activeBorrowings = borrowings.filter((b) => !b.returned_at);
  const returnedBorrowings = borrowings.filter((b) => b.returned_at);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Borrowing Management</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Borrow Book</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Borrow a Book</h3>
            <button
              onClick={handleCancel}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleBorrow} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                User *
              </label>
              <select
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Available Book *
              </label>
              <select
                value={formData.book_id}
                onChange={(e) => setFormData({ ...formData, book_id: e.target.value })}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a book</option>
                {books
                  .filter((b) => b.available)
                  .map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title} by {book.author?.name || 'Unknown'}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Due in (days)
              </label>
              <input
                type="number"
                value={formData.due_days}
                onChange={(e) => setFormData({ ...formData, due_days: parseInt(e.target.value) })}
                min="1"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Borrow
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Active Borrowings</h3>
          <div className="grid gap-4">
            {activeBorrowings.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No active borrowings.</p>
            ) : (
              activeBorrowings.map((borrowing) => (
                <div
                  key={borrowing.id}
                  className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800">{borrowing.book?.title}</h4>
                      <p className="text-sm text-slate-600">Borrowed by {borrowing.user?.full_name}</p>
                      <p className="text-sm text-slate-600">
                        Due: {new Date(borrowing.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleReturn(borrowing.id)}
                      className="flex items-center space-x-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Return</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {returnedBorrowings.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Returned Books</h3>
            <div className="grid gap-4">
              {returnedBorrowings.map((borrowing) => (
                <div
                  key={borrowing.id}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-4"
                >
                  <div>
                    <h4 className="font-semibold text-slate-800">{borrowing.book?.title}</h4>
                    <p className="text-sm text-slate-600">Borrowed by {borrowing.user?.full_name}</p>
                    <p className="text-sm text-slate-500">
                      Returned: {new Date(borrowing.returned_at!).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
