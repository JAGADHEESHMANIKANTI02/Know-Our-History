import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Users, UserCircle, BookMarked, LogOut } from 'lucide-react';
import { AuthorsManager } from './AuthorsManager';
import { BooksManager } from './BooksManager';
import { UsersManager } from './UsersManager';
import { BorrowingsManager } from './BorrowingsManager';

type Tab = 'books' | 'authors' | 'users' | 'borrowings';

export const Dashboard = () => {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('books');

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const tabs = [
    { id: 'books' as Tab, label: 'Books', icon: BookOpen },
    { id: 'authors' as Tab, label: 'Authors', icon: UserCircle },
    { id: 'users' as Tab, label: 'Users', icon: Users },
    { id: 'borrowings' as Tab, label: 'Borrowings', icon: BookMarked },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-800">Know Our History</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="border-b border-slate-200">
            <div className="flex space-x-1 p-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'books' && <BooksManager />}
            {activeTab === 'authors' && <AuthorsManager />}
            {activeTab === 'users' && <UsersManager />}
            {activeTab === 'borrowings' && <BorrowingsManager />}
          </div>
        </div>
      </div>
    </div>
  );
};
