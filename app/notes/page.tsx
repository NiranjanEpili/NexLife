'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Trash2, Edit2, FolderPlus, Folder, FileText, Search, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Note {
  id: string;
  title: string;
  content: string;
  folder: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export default function NotesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<string[]>(['General', 'Study', 'Personal', 'Ideas']);
  const [selectedFolder, setSelectedFolder] = useState<string>('All Notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    folder: 'General',
    is_favorite: false,
  });

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user]);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);

      // Extract unique folders
      const uniqueFolders = Array.from(new Set(data?.map(note => note.folder) || []));
      setFolders(['General', 'Study', 'Personal', 'Ideas', ...uniqueFolders.filter(f => !['General', 'Study', 'Personal', 'Ideas'].includes(f))]);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingNote) {
        const { error } = await supabase
          .from('notes')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingNote.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Note updated successfully' });
      } else {
        const { error } = await supabase
          .from('notes')
          .insert({
            ...formData,
            user_id: user?.id,
          });

        if (error) throw error;
        toast({ title: 'Success', description: 'Note created successfully' });
      }

      setDialogOpen(false);
      resetForm();
      loadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: 'Error',
        description: 'Failed to save note',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Note deleted successfully' });
      loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete note',
        variant: 'destructive',
      });
    }
  };

  const toggleFavorite = async (note: Note) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_favorite: !note.is_favorite })
        .eq('id', note.id);

      if (error) throw error;
      loadNotes();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const addFolder = () => {
    if (newFolderName && !folders.includes(newFolderName)) {
      setFolders([...folders, newFolderName]);
      setNewFolderName('');
      setFolderDialogOpen(false);
      toast({ title: 'Success', description: 'Folder created successfully' });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      folder: 'General',
      is_favorite: false,
    });
    setEditingNote(null);
  };

  const openEditDialog = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      folder: note.folder,
      is_favorite: note.is_favorite,
    });
    setDialogOpen(true);
  };

  const filteredNotes = notes.filter(note => {
    const matchesFolder = selectedFolder === 'All Notes' || selectedFolder === 'Favorites' 
      ? (selectedFolder === 'Favorites' ? note.is_favorite : true)
      : note.folder === selectedFolder;
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-black text-white drop-shadow-lg">📝 Notes & Knowledge</h1>
                <p className="text-purple-100 mt-1 text-lg">Your personal knowledge base</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setFolderDialogOpen(true)}
                  variant="outline"
                  className="bg-white/20 text-white border-white hover:bg-white hover:text-purple-600 font-semibold"
                >
                  <FolderPlus className="mr-2 h-5 w-5" />
                  New Folder
                </Button>
                <Button
                  onClick={() => {
                    resetForm();
                    setDialogOpen(true);
                  }}
                  className="bg-white text-purple-600 hover:bg-purple-50 font-bold shadow-lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  New Note
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
              <Input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/20 border-white text-white placeholder-purple-200 focus:bg-white focus:text-gray-900"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Sidebar - Folders */}
            <Card className="md:col-span-1 border-2 shadow-lg">
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Folders</h3>
                <div className="space-y-2">
                  <Button
                    variant={selectedFolder === 'All Notes' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedFolder('All Notes')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    All Notes
                    <span className="ml-auto text-xs">{notes.length}</span>
                  </Button>
                  <Button
                    variant={selectedFolder === 'Favorites' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedFolder('Favorites')}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Favorites
                    <span className="ml-auto text-xs">{notes.filter(n => n.is_favorite).length}</span>
                  </Button>
                  <div className="border-t pt-2 mt-2">
                    {folders.map(folder => (
                      <Button
                        key={folder}
                        variant={selectedFolder === folder ? 'default' : 'ghost'}
                        className="w-full justify-start mb-1"
                        onClick={() => setSelectedFolder(folder)}
                      >
                        <Folder className="mr-2 h-4 w-4" />
                        {folder}
                        <span className="ml-auto text-xs">{notes.filter(n => n.folder === folder).length}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes Grid */}
            <div className="md:col-span-3">
              {filteredNotes.length === 0 ? (
                <Card className="border-2 border-dashed">
                  <CardContent className="p-12 text-center">
                    <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-500 mb-2">No notes yet</h3>
                    <p className="text-gray-400 mb-4">Create your first note to get started</p>
                    <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Note
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredNotes.map(note => (
                    <Card
                      key={note.id}
                      className="border-2 hover:shadow-xl transition-all cursor-pointer group"
                      onClick={() => openEditDialog(note)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-lg line-clamp-1 flex-1">{note.title}</h3>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(note);
                              }}
                            >
                              <Star className={`h-4 w-4 ${note.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3 mb-3">{note.content}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Folder className="h-3 w-3" />
                            {note.folder}
                          </span>
                          <span>{format(new Date(note.updated_at), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(note);
                            }}
                            className="flex-1"
                          >
                            <Edit2 className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(note.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Note Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {editingNote ? 'Edit Note' : 'Create New Note'}
                </DialogTitle>
                <DialogDescription>
                  {editingNote ? 'Update your note' : 'Add a new note to your knowledge base'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="font-semibold">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter note title..."
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="folder" className="font-semibold">Folder</Label>
                    <select
                      id="folder"
                      value={formData.folder}
                      onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    >
                      {folders.filter(f => f !== 'All Notes' && f !== 'Favorites').map(folder => (
                        <option key={folder} value={folder}>{folder}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="content" className="font-semibold">Content</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Write your note here... (Markdown supported)"
                      className="mt-1 min-h-[300px]"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_favorite"
                      checked={formData.is_favorite}
                      onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="is_favorite" className="cursor-pointer">Mark as favorite</Label>
                  </div>
                </div>
                <DialogFooter className="mt-6 gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  {editingNote && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        handleDelete(editingNote.id);
                        setDialogOpen(false);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  )}
                  <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold">
                    {editingNote ? 'Update' : 'Create'} Note
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* New Folder Dialog */}
          <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>Add a new folder to organize your notes</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="folderName">Folder Name</Label>
                  <Input
                    id="folderName"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="e.g., Projects, Research"
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFolderDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addFolder}>Create Folder</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
