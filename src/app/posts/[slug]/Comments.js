import { getCommentsByPostId } from '@/lib/api';

export default async function Comments({ postId }) {
  const comments = await getCommentsByPostId(postId);

  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <div className="comments-section">
      <h3 className="comments-title">అభిప్రాయాలు ({comments.length} Comments)</h3>
      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment">
            <div className="comment-header">
              {comment.author_avatar_urls && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={comment.author_avatar_urls['48']} 
                    alt={comment.author_name} 
                    className="comment-avatar" 
                  />
                </>
              )}
              <div className="comment-meta">
                <span className="comment-author-name">{comment.author_name}</span>
                <span className="comment-date">{new Date(comment.date).toLocaleDateString()}</span>
              </div>
            </div>
            <div 
              className="comment-content" 
              dangerouslySetInnerHTML={{ __html: comment.content.rendered }} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
