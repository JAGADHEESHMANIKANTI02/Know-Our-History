import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search, Filter } from 'lucide-react';
import { booksApi, authorsApi } from '../../lib/api';
import { Book, Author } from '../../types';

export const BooksManager = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    isbn: '',
    author_id: '',
    description: '',
    published_year: new Date().getFullYear(),
  });
  const [filters, setFilters] = useState({
    search: '',
    author_id: '',
    available: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadAuthors();
    loadBooks();
  }, []);

  useEffect(() => {
    loadBooks();
  }, [filters]);

  const loadAuthors = async () => {
    try {
      const data = await authorsApi.getAll();
      setAuthors(data);
    } catch (err) {
      console.error('Failed to load authors:', err);
    }
  };

  const loadBooks = async () => {
    try {
      setLoading(true);
      const filterParams: { search?: string; author_id?: string; available?: boolean } = {};
      if (filters.search) filterParams.search = filters.search;
      if (filters.author_id) filterParams.author_id = filters.author_id;
      if (filters.available) filterParams.available = filters.available === 'true';

      const data = await booksApi.getAll(filterParams);
      setBooks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingBook) {
        await booksApi.update(editingBook.id, formData);
      } else {
        await booksApi.create(formData);
      }
      setShowForm(false);
      setEditingBook(null);
      setFormData({
        title: '',
        isbn: '',
        author_id: '',
        description: '',
        published_year: new Date().getFullYear(),
      });
      loadBooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save book');
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      isbn: book.isbn,
      author_id: book.author_id,
      description: book.description,
      published_year: book.published_year,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      await booksApi.delete(id);
      loadBooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete book');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBook(null);
    setFormData({
      title: '',
      isbn: '',
      author_id: '',
      description: '',
      published_year: new Date().getFullYear(),
    });
    setError('');
  };

  if (loading && books.length === 0) {
    return <div className="text-center py-8">Loading books...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Books</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Book</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!showForm && (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="w-4 h-4 text-slate-600" />
            <h3 className="font-medium text-slate-700">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search books..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filters.author_id}
              onChange={(e) => setFilters({ ...filters, author_id: e.target.value })}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Authors</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
            <select
              value={filters.available}
              onChange={(e) => setFilters({ ...filters, available: e.target.value })}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Books</option>
              <option value="true">Available</option>
              <option value="false">Borrowed</option>
            </select>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800">
              {editingBook ? 'Edit Book' : 'New Book'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Book title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  ISBN *
                </label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ISBN"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Author *
                </label>
                <select
                  value={formData.author_id}
                  onChange={(e) => setFormData({ ...formData, author_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select an author</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Published Year
                </label>
                <input
                  type="number"
                  value={formData.published_year}
                  onChange={(e) => setFormData({ ...formData, published_year: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingBook ? 'Update' : 'Create'}
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

      <div className="grid gap-4">
        {books.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No books found.</p>
        ) : (
          books.map((book) => (
            <div
              key={book.id}
              className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-800">{book.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        book.available
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {book.available ? 'Available' : 'Borrowed'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">
                    by {book.author?.name || 'Unknown Author'} • {book.published_year}
                  </p>
                  <p className="text-sm text-slate-500 mb-2">ISBN: {book.isbn}</p>
                  <p className="text-slate-600">{book.description || 'No description available'}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(book)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
