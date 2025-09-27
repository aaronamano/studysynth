import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import NcryptJs from 'ncrypt-js';
import jwt from 'jsonwebtoken';

// replace secretKey with an env variable for production. secretKey is the password key that encrypts and decrypts the API keys.
const secretKey = process.env.SECRET_KEY as string;
const ncrypt = new NcryptJs(secretKey);

interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

async function getUserFromToken(token: string) {
  let decodedToken: DecodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
  } catch (error) {
    return null;
  }

  const client = await clientPromise;
  const db = client.db('studysynth');
  const accounts = db.collection('accounts');
  return await accounts.findOne({ _id: new ObjectId(decodedToken.userId) });
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

    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ message: 'User not found or invalid token' }, { status: 404 });
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

    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ message: 'User not found or invalid token' }, { status: 404 });
    }

    const { perplexityApiKey, openaiApiKey } = await req.json();

    const encryptedPerplexityKey = perplexityApiKey ? ncrypt.encrypt(perplexityApiKey) : '';
    const encryptedOpenaiKey = openaiApiKey ? ncrypt.encrypt(openaiApiKey) : '';

    const client = await clientPromise;
    const db = client.db('studysynth');
    const accounts = db.collection('accounts');

    await accounts.updateOne(
      { _id: user._id },
      { $set: { perplexityKey: encryptedPerplexityKey, openaiKey: encryptedOpenaiKey } }
    );

    return NextResponse.json({ message: 'API keys updated successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
