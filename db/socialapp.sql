-- this is database for Postgresql --
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_password_reset DATE,
  forgot_password_last_used TIMESTAMP,
  forgot_password_count INT DEFAULT 0,
  temp_password_hash VARCHAR(255),
  points INT DEFAULT 0
);


CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  content_text TEXT NOT NULL,
  media_url VARCHAR(500),
  media_type TEXT DEFAULT 'none'
    CHECK (media_type IN ('image','video','none')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_user ON posts(user_id);


CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_user ON comments(user_id);


CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (post_id, user_id)
);


CREATE TABLE shares (
  id SERIAL PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE shared_posts (
  id SERIAL PRIMARY KEY,
  original_post_id INT NOT NULL,
  shared_by INT NOT NULL,
  owner_user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shared_owner ON shared_posts(owner_user_id);
CREATE INDEX idx_shared_original ON shared_posts(original_post_id);


CREATE TABLE friend_requests (
  id SERIAL PRIMARY KEY,
  from_user_id INT NOT NULL,
  to_user_id INT NOT NULL,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_friend_requests_from ON friend_requests(from_user_id);
CREATE INDEX idx_friend_requests_to ON friend_requests(to_user_id);


CREATE TABLE friendships (
  id SERIAL PRIMARY KEY,
  user1_id INT NOT NULL,
  user2_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user1_id, user2_id)
);


CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ai_answer TEXT,
  type TEXT DEFAULT 'AI'
    CHECK (type IN ('AI','COMMUNITY'))
);

CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  question_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE answer_votes (
  id SERIAL PRIMARY KEY,
  answer_id INT NOT NULL,
  user_id INT NOT NULL,
  vote TEXT NOT NULL
    CHECK (vote IN ('UP','DOWN')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (answer_id, user_id)
);

CREATE TABLE point_transactions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  change_amount INT NOT NULL,
  reason VARCHAR(255),
  related_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE point_transfers (
  id SERIAL PRIMARY KEY,
  from_user INT,
  to_user INT,
  points INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  plan TEXT DEFAULT 'FREE'
    CHECK (plan IN ('FREE','BRONZE','SILVER','GOLD')),
  price INT NOT NULL,
  questions_per_day INT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
