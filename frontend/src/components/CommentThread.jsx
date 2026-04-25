import React, { useState } from 'react';
import styles from './CommentThread.module.css';

const CommentThread = ({ comments, currentUser, userRole, onAddComment, onEditComment, onDeleteComment }) => {
    const [newComment, setNewComment] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');

    const timeAgo = (dateString) => {
        const diff = new Date() - new Date(dateString);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours} hours ago`;
        return `${Math.floor(hours/24)} days ago`;
    };

    const handleAdd = () => {
        if (newComment.trim()) {
            onAddComment(newComment);
            setNewComment('');
        }
    };

    const startEdit = (comment) => {
        setEditingId(comment.id);
        setEditContent(comment.content);
    };

    const handleEditSave = (id) => {
        onEditComment(id, editContent);
        setEditingId(null);
    };

    return (
        <div className={styles.container}>
            <div className={styles.thread}>
                {comments?.length === 0 && <p className={styles.empty}>No comments yet.</p>}
                {comments?.map(comment => (
                    <div key={comment.id} className={styles.comment}>
                        <div className={styles.avatar}>
                            {comment.authorEmail?.substring(0, 2).toUpperCase() || 'U'}
                        </div>
                        <div className={styles.commentBody}>
                            <div className={styles.commentHeader}>
                                <span className={styles.author}>{comment.authorEmail}</span>
                                <span className={styles.roleBadge}>{comment.authorRole}</span>
                                <span className={styles.timestamp}>{timeAgo(comment.createdAt)}</span>
                                {comment.isEdited && <span className={styles.editedLabel}>(Edited)</span>}
                            </div>
                            
                            {editingId === comment.id ? (
                                <div className={styles.editArea}>
                                    <textarea value={editContent} onChange={e => setEditContent(e.target.value)} />
                                    <div className={styles.editActions}>
                                        <button onClick={() => handleEditSave(comment.id)} className={styles.saveBtn}>Save</button>
                                        <button onClick={() => setEditingId(null)} className={styles.cancelBtn}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.content}>{comment.content}</div>
                            )}

                            <div className={styles.actions}>
                                {(comment.authorEmail === currentUser) && editingId !== comment.id && (
                                    <button onClick={() => startEdit(comment)} className={styles.actionBtn}>✏️ Edit</button>
                                )}
                                {(comment.authorEmail === currentUser || userRole === 'ADMIN') && (
                                    <button onClick={() => onDeleteComment(comment.id)} className={styles.actionBtn}>🗑️ Delete</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.addComment}>
                <textarea 
                    placeholder="Add a comment..." 
                    value={newComment} 
                    onChange={e => setNewComment(e.target.value)}
                    className={styles.newCommentInput}
                />
                <button onClick={handleAdd} className={styles.postBtn} disabled={!newComment.trim()}>
                    Post Comment
                </button>
            </div>
        </div>
    );
};
export default CommentThread;
