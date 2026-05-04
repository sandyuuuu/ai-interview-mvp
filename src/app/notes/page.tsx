"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Star, StarOff, Edit2, Trash2, Save, X } from "lucide-react";
import { ReviewNote, QuestionType } from "@/lib/types";
import { storage } from "@/lib/storage";
import { formatTime } from "@/lib/utils";

const questionTypes: QuestionType[] = [
  "自我介绍",
  "项目经历",
  "设计方法",
  "业务理解",
  "用户研究",
  "团队协作",
  "职业规划",
  "开放性问题",
  "技术问题",
  "案例分析",
];

export default function NotesPage() {
  const [notes, setNotes] = useState<ReviewNote[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    setNotes(storage.getNotes());
  };

  const filteredNotes = notes.filter((note) => {
    if (favoritesOnly && !note.isFavorite) return false;
    if (search && !note.title.toLowerCase().includes(search.toLowerCase()) && !note.content.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (selectedTypes.length > 0 && note.questionType && !selectedTypes.includes(note.questionType)) return false;
    return true;
  });

  const toggleFavorite = (id: string) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n));
    setNotes(updated);
    const note = updated.find((n) => n.id === id);
    if (note) storage.saveNote(note);
  };

  const startEdit = (note: ReviewNote) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const updated = notes.map((n) =>
      n.id === editingId
        ? { ...n, title: editTitle, content: editContent, updatedAt: Date.now() }
        : n
    );
    setNotes(updated);
    const note = updated.find((n) => n.id === editingId);
    if (note) storage.saveNote(note);
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
  };

  const deleteNote = (id: string) => {
    if (confirm("确定删除这条笔记吗？")) {
      storage.deleteNote(id);
      loadNotes();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">复盘笔记</h1>
        <p className="text-sm text-slate-500 mt-0.5">查看和管理所有面试复盘内容，支持编辑、搜索和收藏</p>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              placeholder="搜索笔记标题或内容"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-1.5 ${favoritesOnly ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
            >
              {favoritesOnly ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
              收藏
            </button>
            <button className="px-3 py-2 rounded-lg border border-slate-200 text-sm flex items-center gap-1.5 text-slate-700 hover:bg-slate-50">
              <Filter className="w-4 h-4" />
              筛选
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {questionTypes.map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedTypes((prev) =>
                  prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
                );
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${selectedTypes.includes(type) ? "bg-primary-100 text-primary-700 border border-primary-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="card p-8 text-center text-slate-400 text-sm">
            <p>暂无笔记，去模拟面试或导入记录来创建复盘笔记吧</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div key={note.id} className="card p-5">
              {editingId === note.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <textarea
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    rows={8}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="btn-primary text-xs gap-1.5">
                      <Save className="w-3.5 h-3.5" />
                      保存
                    </button>
                    <button onClick={cancelEdit} className="btn-secondary text-xs gap-1.5">
                      <X className="w-3.5 h-3.5" />
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-slate-800">{note.title}</h3>
                        {note.analysis && (
                          <span className={`badge ${note.analysis.score >= 80 ? "bg-green-50 text-green-700" : note.analysis.score >= 60 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                            {note.analysis.score} 分
                          </span>
                        )}
                        {note.isFavorite && (
                          <span className="badge bg-yellow-50 text-yellow-700">
                            <Star className="w-3 h-3 mr-1" /> 收藏
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-xs text-slate-500">
                        {note.company && <span>{note.company}</span>}
                        {note.position && <span>· {note.position}</span>}
                        {note.round && <span>· {note.round}</span>}
                        {note.questionType && <span>· {note.questionType}</span>}
                        <span>· {formatTime(note.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button onClick={() => toggleFavorite(note.id)} className="p-1.5 rounded-lg hover:bg-slate-100">
                        {note.isFavorite ? <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> : <Star className="w-4 h-4 text-slate-400" />}
                      </button>
                      <button onClick={() => startEdit(note)} className="p-1.5 rounded-lg hover:bg-slate-100">
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </button>
                      <button onClick={() => deleteNote(note.id)} className="p-1.5 rounded-lg hover:bg-slate-100">
                        <Trash2 className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-3">
                    <p className="text-xs text-slate-500 mb-1">内容</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
                  </div>

                  {note.analysis && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="font-medium text-slate-700 mb-1">主要问题</p>
                        <ul className="space-y-0.5">
                          {note.analysis.problems.slice(0, 2).map((p, i) => (
                            <li key={i} className="text-slate-600">· {p}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 mb-1">优化建议</p>
                        <ul className="space-y-0.5">
                          {note.analysis.suggestions.slice(0, 2).map((s, i) => (
                            <li key={i} className="text-slate-600">· {s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
