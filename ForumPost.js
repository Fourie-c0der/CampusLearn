class ForumPost {
  constructor(content, postedBy, anonymous = false) {
    this.content = content;
    this.postedBy = postedBy;
    this.anonymous = anonymous;
    this.upvotes = 0;
    this.replies = [];
  }

  upvote() {
    this.upvotes++;
  }

  reply(reply) {
    this.replies.push(reply);
  }
}
module.exports = ForumPost;