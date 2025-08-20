import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import NcryptJs from 'ncrypt-js';

// replace secretKey with an env variable for production. secretKey is the password key that encrypts and decrypts the API keys.
const secretKey = process.env.SECRET_KEY as string;
const ncrypt = new NcryptJs(secretKey);

async function getUser(token: string) {
  const client = await clientPromise;
  const db = client.db('studysynth');
  const accounts = db.collection('accounts');
  return await accounts.findOne({ _id: new ObjectId(token) });
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Authorization header missing' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Token missing' }, { status: 401 });
    }

    const user = await getUser(token);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const decryptedPerplexityKey = user.perplexityKey ? ncrypt.decrypt(user.perplexityKey) : '';
    const decryptedOpenaiKey = user.openaiKey ? ncrypt.decrypt(user.openaiKey) : '';

    return NextResponse.json({ perplexityKey: decryptedPerplexityKey, openaiKey: decryptedOpenaiKey }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Authorization header missing' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Token missing' }, { status: 401 });
    }

    const user = await getUser(token);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { perplexityApiKey, openaiApiKey } = await req.json();

    const encryptedPerplexityKey = perplexityApiKey ? ncrypt.encrypt(perplexityApiKey) : '';
    const encryptedOpenaiKey = openaiApiKey ? ncrypt.encrypt(openaiApiKey) : '';

    const client = await clientPromise;
    const db = client.db('studysynth');
    const accounts = db.collection('accounts');

    await accounts.updateOne(
      { _id: new ObjectId(token) },
      { $set: { perplexityKey: encryptedPerplexityKey, openaiKey: encryptedOpenaiKey } }
    );

    return NextResponse.json({ message: 'API keys updated successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
