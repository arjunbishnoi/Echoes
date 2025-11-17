export type Migration = {
  version: number;
  statements: string[];
};

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    statements: [
      `PRAGMA foreign_keys = ON;`,
      `CREATE TABLE IF NOT EXISTS echoes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        imageUrl TEXT,
        status TEXT,
        isPrivate INTEGER DEFAULT 1,
        shareMode TEXT,
        ownerId TEXT,
        ownerName TEXT,
        ownerPhotoURL TEXT,
        lockDate TEXT,
        unlockDate TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );`,
      `CREATE INDEX IF NOT EXISTS idx_echoes_ownerId ON echoes(ownerId);`,
      `CREATE INDEX IF NOT EXISTS idx_echoes_updatedAt ON echoes(updatedAt);`,
      `CREATE TABLE IF NOT EXISTS collaborators (
        echoId TEXT NOT NULL,
        userId TEXT NOT NULL,
        displayName TEXT,
        photoURL TEXT,
        PRIMARY KEY (echoId, userId),
        FOREIGN KEY (echoId) REFERENCES echoes(id) ON DELETE CASCADE
      );`,
      `CREATE INDEX IF NOT EXISTS idx_collaborators_user ON collaborators(userId);`,
      `CREATE TABLE IF NOT EXISTS media (
        id TEXT PRIMARY KEY,
        echoId TEXT NOT NULL,
        type TEXT NOT NULL,
        uri TEXT,
        thumbnailUri TEXT,
        storagePath TEXT,
        status TEXT DEFAULT 'pending',
        createdAt TEXT,
        uploadedBy TEXT,
        uploadedByName TEXT,
        uploadedByPhotoURL TEXT,
        FOREIGN KEY (echoId) REFERENCES echoes(id) ON DELETE CASCADE
      );`,
      `CREATE INDEX IF NOT EXISTS idx_media_echoId ON media(echoId);`,
      `CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        echoId TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        timestamp TEXT NOT NULL,
        userId TEXT,
        userName TEXT,
        userAvatar TEXT,
        mediaType TEXT,
        FOREIGN KEY (echoId) REFERENCES echoes(id) ON DELETE CASCADE
      );`,
      `CREATE INDEX IF NOT EXISTS idx_activities_echo_ts ON activities(echoId, timestamp);`,
      `CREATE TABLE IF NOT EXISTS friends (
        id TEXT PRIMARY KEY,
        displayName TEXT,
        username TEXT,
        photoURL TEXT,
        bio TEXT,
        updatedAt TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS pending_ops (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entityType TEXT NOT NULL,
        entityId TEXT NOT NULL,
        action TEXT NOT NULL,
        payload TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        retryCount INTEGER DEFAULT 0
      );`,
      `CREATE INDEX IF NOT EXISTS idx_pending_ops_entity ON pending_ops(entityType, entityId);`,
    ],
  },
];
