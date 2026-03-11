import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: CachedConnection = (global as any).mongoose || {
  conn: null,
  promise: null,
};

async function dbConnect() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined. Please set the MONGODB_URI environment variable.');
    throw new Error('Database connection not configured. Please set MONGODB_URI environment variable.');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
