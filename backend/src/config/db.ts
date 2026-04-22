import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined in environment');

  mongoose.connection.on('connected', () =>
    console.log('[MongoDB] Connected to', mongoose.connection.name)
  );
  mongoose.connection.on('error', (err) =>
    console.error('[MongoDB] Connection error:', err)
  );
  mongoose.connection.on('disconnected', () =>
    console.warn('[MongoDB] Disconnected')
  );

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
}
