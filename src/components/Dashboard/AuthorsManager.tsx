import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { authorsApi } from '../../lib/api';
import { Author } from '../../types';

export const AuthorsManager = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [formData, setFormData] = useState({ name: '', bio: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadAuthors();
  }, []);

  const loadAuthors = async () => {
    try {
      setLoading(true);
      const data = await authorsApi.getAll();
      setAuthors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load authors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingAuthor) {
        await authorsApi.update(editingAuthor.id, formData);
      } else {
        await authorsApi.create(formData);
      }
      setShowForm(false);
      setEditingAuthor(null);
      setFormData({ name: '', bio: '' });
      loadAuthors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save author');
    }
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setFormData({ name: author.name, bio: author.bio });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this author?')) return;

    try {
      await authorsApi.delete(id);
      loadAuthors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete author');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAuthor(null);
    setFormData({ name: '', bio: '' });
    setError('');
  };

  if (loading) {
    return <div className="text-center py-8">Loading authors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Authors</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Author</span>
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
            <h3 className="text-lg font-semibold text-slate-800">
              {editingAuthor ? 'Edit Author' : 'New Author'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Author name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Biography
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief biography..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingAuthor ? 'Update' : 'Create'}
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
        {authors.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No authors found. Add your first author!</p>
        ) : (
          authors.map((author) => (
            <div
              key={author.id}
              className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800">{author.name}</h3>
                  <p className="text-slate-600 mt-1">{author.bio || 'No biography available'}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(author)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(author.id)}
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
