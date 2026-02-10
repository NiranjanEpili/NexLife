'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, FileText, Link as LinkIcon, Trash2, Edit2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface Academic {
  id: string;
  subject: string;
  title: string;
  description: string;
  file_url: string | null;
  links: any[];
  progress: number;
}

export default function AcademicsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [academics, setAcademics] = useState<Academic[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Academic | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    title: '',
    description: '',
    file_url: '',
    links: [] as { title: string; url: string }[],
    progress: 0,
  });
  const [newLink, setNewLink] = useState({ title: '', url: '' });

  useEffect(() => {
    if (user) {
      loadAcademics();
    }
  }, [user]);

  const loadAcademics = async () => {
    try {
      const { data, error } = await supabase
        .from('academics')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAcademics(data || []);
    } catch (error) {
      console.error('Error loading academics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('academics')
          .update({
            ...formData,
            links: JSON.stringify(formData.links),
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Item updated successfully' });
      } else {
        const { error } = await supabase
          .from('academics')
          .insert({
            ...formData,
            links: JSON.stringify(formData.links),
            user_id: user?.id,
          });

        if (error) throw error;
        toast({ title: 'Success', description: 'Item created successfully' });
      }

      setDialogOpen(false);
      resetForm();
      loadAcademics();
    } catch (error) {
      console.error('Error saving academic item:', error);
      toast({
        title: 'Error',
        description: 'Failed to save item',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('academics')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Item deleted successfully' });
      loadAcademics();
    } catch (error) {
      console.error('Error deleting academic item:', error);
    }
  };

  const handleProgressUpdate = async (id: string, newProgress: number) => {
    try {
      const { error } = await supabase
        .from('academics')
        .update({ progress: newProgress })
        .eq('id', id);

      if (error) throw error;
      loadAcademics();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const openEditDialog = (item: Academic) => {
    setEditingItem(item);
    setFormData({
      subject: item.subject,
      title: item.title,
      description: item.description,
      file_url: item.file_url || '',
      links: item.links || [],
      progress: item.progress,
    });
    setDialogOpen(true);
  };

  const addLink = () => {
    if (newLink.title && newLink.url) {
      setFormData({
        ...formData,
        links: [...formData.links, newLink],
      });
      setNewLink({ title: '', url: '' });
    }
  };

  const removeLink = (index: number) => {
    setFormData({
      ...formData,
      links: formData.links.filter((_, i) => i !== index),
    });
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      title: '',
      description: '',
      file_url: '',
      links: [],
      progress: 0,
    });
    setEditingItem(null);
    setNewLink({ title: '', url: '' });
  };

  const groupedAcademics = academics.reduce((acc, item) => {
    if (!acc[item.subject]) {
      acc[item.subject] = [];
    }
    acc[item.subject].push(item);
    return acc;
  }, {} as Record<string, Academic[]>);

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Academics</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage your study materials and progress
              </p>
            </div>
            <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Study Material
            </Button>
          </div>

          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>
          ) : Object.keys(groupedAcademics).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedAcademics).map(([subject, items]) => (
                <Card key={subject}>
                  <CardHeader>
                    <CardTitle>{subject}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{item.title}</h3>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(item)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {item.file_url && (
                              <a
                                href={item.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                              >
                                <FileText className="h-4 w-4" />
                                View PDF
                              </a>
                            )}

                            {item.links && item.links.length > 0 && (
                              <div className="space-y-2">
                                {item.links.map((link: any, idx: number) => (
                                  <a
                                    key={idx}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                  >
                                    <LinkIcon className="h-4 w-4" />
                                    {link.title}
                                  </a>
                                ))}
                              </div>
                            )}

                            <div className="pt-2">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Progress</span>
                                <span className="text-sm text-muted-foreground">{item.progress}%</span>
                              </div>
                              <Progress value={item.progress} className="h-2" />
                              <div className="flex gap-2 mt-2">
                                {[25, 50, 75, 100].map((value) => (
                                  <Button
                                    key={value}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleProgressUpdate(item.id, value)}
                                    disabled={item.progress === value}
                                  >
                                    {value}%
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  No study materials yet. Add your first one!
                </p>
              </CardContent>
            </Card>
          )}

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Study Material' : 'Add Study Material'}</DialogTitle>
                <DialogDescription>
                  {editingItem ? 'Update your study material' : 'Add new study material'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="file_url">PDF URL</Label>
                    <Input
                      id="file_url"
                      type="url"
                      placeholder="https://example.com/document.pdf"
                      value={formData.file_url}
                      onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Important Links</Label>
                    <div className="space-y-2 mt-2">
                      {formData.links.map((link, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input value={link.title} readOnly className="flex-1" />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeLink(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Link title"
                        value={newLink.title}
                        onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                      />
                      <Input
                        placeholder="URL"
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      />
                      <Button type="button" onClick={addLink} size="sm">
                        Add
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="progress">Initial Progress (%)</Label>
                    <Input
                      id="progress"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingItem ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
