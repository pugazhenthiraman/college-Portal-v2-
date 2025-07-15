import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const districtId = Number(searchParams.get('districtId'));
  if (!districtId) return NextResponse.json({ error: 'Missing districtId' }, { status: 400 });
  const blocks = await prisma.block.findMany({ where: { districtId }, orderBy: { name: 'asc' } });
  return NextResponse.json(blocks);
} 